import type { IncomingMessage, ServerResponse } from 'http';
import { pool } from '../api-lib/db.js';

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

  const { farmerId, donorName, amount, message } = req.body;

  if (!farmerId || !amount) {
    res.status(400).json({ error: "Missing required parameters: farmerId and amount" });
    return;
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Load current farmer details
    const farmerRes = await client.query('SELECT * FROM farmers WHERE id = $1', [farmerId]);
    if (farmerRes.rows.length === 0) {
      res.status(404).json({ error: "Farmer not found" });
      await client.query('ROLLBACK');
      return;
    }

    const farmer = farmerRes.rows[0];

    // 2. Add donation record
    await client.query(`
      INSERT INTO donations (farmer_id, farmer_name, donor_name, amount, message, date)
      VALUES ($1, $2, $3, $4, $5, 'Just now')
    `, [
      farmerId,
      farmer.name,
      donorName || "Anonymous Supporter",
      amount,
      message || ""
    ]);

    // 3. Update raised amount
    const newRaised = Math.min(farmer.goal, farmer.raised + amount);
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

    res.status(200).json(mapFarmerRow(updateRes.rows[0]));
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error("API error in donate handler:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  } finally {
    client.release();
  }
}
