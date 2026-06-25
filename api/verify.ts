import type { IncomingMessage, ServerResponse } from 'http';
import { pool } from './db.js';

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
  locationLink: row.location_link
});

export default async function handler(req: ExtendedRequest, res: ExtendedResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, OPTIONS, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).send('OK');
    return;
  }

  const { id } = req.query;
  if (!id) {
    res.status(400).json({ error: "Missing required parameter: id" });
    return;
  }

  try {
    const farmerId = parseInt(id as string);

    // DELETE Action
    if (req.method === 'DELETE') {
      await pool.query('DELETE FROM farmers WHERE id = $1', [farmerId]);
      res.status(200).json({ success: true });
      return;
    }

    // Load current farmer details
    const farmerCheck = await pool.query('SELECT * FROM farmers WHERE id = $1', [farmerId]);
    if (farmerCheck.rows.length === 0) {
      res.status(404).json({ error: "Farmer case not found" });
      return;
    }

    const currentFarmer = farmerCheck.rows[0];

    // POST: Verify Case
    if (req.method === 'POST') {
      const { approvedGoal, story, breakdown } = req.body || {};
      const goalVal = approvedGoal ? parseInt(approvedGoal) : currentFarmer.goal;
      const storyVal = story ?? currentFarmer.story;
      const timeline = currentFarmer.timeline;
      const breakdownVal = breakdown ? JSON.stringify(breakdown) : JSON.stringify(currentFarmer.breakdown || []);
      
      const pendingIndex = timeline.findIndex((t: any) => t.title === "Verification Pending");
      if (pendingIndex !== -1) {
        timeline[pendingIndex].status = "completed";
        timeline[pendingIndex].description = "Field verification successfully completed by NGO partner.";
      }

      const fundraisingIndex = timeline.findIndex((t: any) => t.title === "Fundraising");
      if (fundraisingIndex !== -1) {
        timeline[fundraisingIndex].status = "active";
        timeline[fundraisingIndex].description = "Fundraiser live. Raising funds for recovery.";
      }

      const { rows } = await pool.query(
        'UPDATE farmers SET verified = true, goal = $1, story = $2, timeline = $3, breakdown = $4 WHERE id = $5 RETURNING *',
        [goalVal, storyVal, JSON.stringify(timeline), breakdownVal, farmerId]
      );

      res.status(200).json(mapFarmerRow(rows[0]));
      return;
    }

    // PUT: Update Case Details
    if (req.method === 'PUT') {
      const f = req.body;
      
      const { rows } = await pool.query(`
        UPDATE farmers 
        SET name = $1, age = $2, district = $3, village = $4, crop = $5, disaster = $6, goal = $7, land_area = $8, damage = $9, story = $10, breakdown = $11, farmer_phone = $12, requested_amount = $13, location_link = $14
        WHERE id = $15
        RETURNING *
      `, [
        f.name ?? currentFarmer.name,
        f.age ?? currentFarmer.age,
        f.district ?? currentFarmer.district,
        f.village ?? currentFarmer.village,
        f.crop ?? currentFarmer.crop,
        f.disaster ?? currentFarmer.disaster,
        f.goal ?? currentFarmer.goal,
        f.landArea ?? currentFarmer.land_area,
        f.damage ?? currentFarmer.damage,
        f.story ?? currentFarmer.story,
        f.breakdown ? JSON.stringify(f.breakdown) : JSON.stringify(currentFarmer.breakdown),
        f.farmerPhone ?? currentFarmer.farmer_phone,
        f.requestedAmount ?? currentFarmer.requested_amount,
        f.locationLink ?? currentFarmer.location_link,
        farmerId
      ]);

      res.status(200).json(mapFarmerRow(rows[0]));
      return;
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("API error in verify handler:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
