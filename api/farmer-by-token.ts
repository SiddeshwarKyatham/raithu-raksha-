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
  imageProofs: row.image_proofs,
  locationLink: row.location_link,
  status: row.status,
  verificationToken: row.verification_token,
  tokenExpiry: row.token_expiry,
  tokenUsed: row.token_used,
  bankDetails: row.bank_details
});

export default async function handler(req: ExtendedRequest, res: ExtendedResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).send('OK');
    return;
  }

  const { token } = req.query;
  if (!token) {
    res.status(400).json({ error: "Token is required." });
    return;
  }

  try {
    const { rows } = await pool.query('SELECT * FROM farmers WHERE verification_token = $1', [token]);
    if (rows.length === 0) {
      res.status(404).json({ error: "Invalid verification link." });
      return;
    }

    const row = rows[0];

    if (row.token_used) {
      res.status(400).json({ error: "used", message: "This verification link has already been used." });
      return;
    }

    const expiryTime = new Date(row.token_expiry).getTime();
    if (expiryTime < Date.now()) {
      res.status(400).json({ error: "expired", farmerId: row.id, message: "This verification link has expired." });
      return;
    }

    // GET Request: return farmer details
    if (req.method === 'GET') {
      res.status(200).json(mapFarmerRow(row));
      return;
    }

    // POST Request: Submit edits & bank details, mark verified
    if (req.method === 'POST') {
      const f = req.body;
      const bankDetails = f.bankDetails || {};
      
      const newTimeline = [...(row.timeline || [])];
      const pendingIndex = newTimeline.findIndex((t: any) => t.title === "Verification Pending");
      if (pendingIndex !== -1) {
        newTimeline[pendingIndex].description = "Farmer contact verified. Awaiting physical NGO coordinate check.";
      }

      await pool.query(`
        UPDATE farmers
        SET name = $1, age = $2, district = $3, village = $4, crop = $5, disaster = $6, 
            land_area = $7, damage = $8, requested_amount = $9, story = $10, 
            image_proofs = $11, video_proof = $12, location_link = $13,
            bank_details = $14, token_used = true, status = 'Farmer Contact Verified',
            timeline = $15
        WHERE id = $16
      `, [
        f.name ?? row.name,
        f.age ? parseInt(f.age) : row.age,
        f.district ?? row.district,
        f.village ?? row.village,
        f.crop ?? row.crop,
        f.disaster ?? row.disaster,
        f.landArea ?? row.land_area,
        f.damage ?? row.damage,
        f.requestedAmount ? parseInt(f.requestedAmount) : row.requested_amount,
        f.story ?? row.story,
        JSON.stringify(f.imageProofs || row.image_proofs || []),
        f.videoProof ?? row.video_proof,
        f.locationLink ?? row.location_link,
        JSON.stringify(bankDetails),
        JSON.stringify(newTimeline),
        row.id
      ]);

      res.status(200).json({ success: true });
      return;
    }

    res.status(405).json({ error: "Method not allowed." });
  } catch (error: any) {
    console.error("Error in farmer-by-token handler:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
