import type { IncomingMessage, ServerResponse } from 'http';
import crypto from 'crypto';
import { pool } from './db';

interface ExtendedRequest extends IncomingMessage {
  query: Record<string, string | string[]>;
  body: any;
  method?: string;
}

interface ExtendedResponse extends ServerResponse {
  status: (code: number) => ExtendedResponse;
  json: (data: any) => void;
  send: (data: any) => void;
}

const mapFarmerRow = (row: any) => ({
  id: row.id,
  name: row.name,
  age: row.age,
  district: row.district,
  village: row.village,
  crop: row.crop,
  disaster: row.disaster,
  goal: row.goal,
  raised: row.raised,
  landArea: row.land_area,
  damage: row.damage,
  image: row.image,
  story: row.story,
  breakdown: row.breakdown,
  gallery: row.gallery,
  timeline: row.timeline,
  verified: row.verified,
  farmerPhone: row.farmer_phone,
  requestedAmount: row.requested_amount,
  videoProof: row.video_proof,
  imageProofs: row.image_proofs
});

export default async function handler(req: ExtendedRequest, res: ExtendedResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).send('OK');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      farmerId,
      amount,
      donorName,
      donorMessage
    } = req.body || {};

    // 1. Missing fields check
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      res.status(400).json({ error: "Missing required Razorpay parameters: payment_id, order_id, or signature." });
      return;
    }

    if (!farmerId || !amount) {
      res.status(400).json({ error: "Missing donation context details: farmerId and amount." });
      return;
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      res.status(500).json({ error: "Razorpay Secret Key is not configured on the server." });
      return;
    }

    // 2. Algorithm signature validation
    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
      console.warn("Razorpay signature verification failed!");
      res.status(400).json({ error: "Payment verification failed: Signature mismatch." });
      return;
    }

    // 3. Signature matched! Save donation and update farmer progress in database
    const amountInRupees = parseFloat(amount);
    if (isNaN(amountInRupees) || amountInRupees <= 0) {
      res.status(400).json({ error: "Invalid donation amount." });
      return;
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Load farmer
      const farmerRes = await client.query('SELECT * FROM farmers WHERE id = $1', [farmerId]);
      if (farmerRes.rows.length === 0) {
        res.status(404).json({ error: "Farmer profile not found." });
        await client.query('ROLLBACK');
        return;
      }

      const farmer = farmerRes.rows[0];

      // Add donation record referencing the payment ID
      const txMsg = donorMessage 
        ? `${donorMessage} (Verified via Razorpay: ${razorpay_payment_id})`
        : `Verified via Razorpay: ${razorpay_payment_id}`;

      await client.query(`
        INSERT INTO donations (farmer_id, farmer_name, donor_name, amount, message, date)
        VALUES ($1, $2, $3, $4, $5, 'Just now')
      `, [
        farmerId,
        farmer.name,
        donorName || "Anonymous Supporter",
        amountInRupees,
        txMsg
      ]);

      // Calculate and update raised funds
      const newRaised = Math.min(farmer.goal, farmer.raised + amountInRupees);
      let timeline = farmer.timeline;

      if (newRaised >= farmer.goal) {
        const activeIndex = timeline.findIndex((t: any) => t.status === "active");
        if (activeIndex !== -1) {
          timeline[activeIndex].status = "completed";
        }
        const fundraisingIndex = timeline.findIndex((t: any) => t.title === "Fundraising");
        if (fundraisingIndex !== -1) {
          timeline[fundraisingIndex].title = "Fully Funded";
          timeline[fundraisingIndex].description = "Recovery funds fully secured. Implementation beginning.";
          timeline[fundraisingIndex].status = "completed";
        }
      }

      const updateRes = await client.query(`
        UPDATE farmers 
        SET raised = $1, timeline = $2 
        WHERE id = $3 
        RETURNING *
      `, [newRaised, JSON.stringify(timeline), farmerId]);

      await client.query('COMMIT');

      res.status(200).json({
        success: true,
        farmer: mapFarmerRow(updateRes.rows[0])
      });

    } catch (dbError: any) {
      await client.query('ROLLBACK');
      console.error("Database transaction failed during payment verification:", dbError);
      res.status(500).json({ error: "Payment was verified but failed to record in database." });
    } finally {
      client.release();
    }

  } catch (error: any) {
    console.error("Error in verify-payment endpoint:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
