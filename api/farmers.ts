import type { IncomingMessage, ServerResponse } from 'http';
import crypto from 'crypto';
import { pool, initDB } from '../api-lib/db.js';
import { sendWhatsAppMessage } from '../api-lib/notification-helper.js';

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
  // Add CORS headers for local dev & Vercel deployment
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).send('OK');
    return;
  }

  try {
    // Ensure DB is initialized
    await initDB();

    if (req.method === 'GET') {
      const { rows } = await pool.query('SELECT * FROM farmers ORDER BY id ASC');
      const mapped = rows.map(mapFarmerRow);
      res.status(200).json(mapped);
      return;
    }

    if (req.method === 'POST') {
      const f = req.body;
      const timeline = [
        { title: "Report Submitted", description: "Farmer reported on platform via website form.", date: "Today", status: "completed" },
        { title: "Verification Pending", description: "Verification team scheduled for field visit.", date: "Tomorrow", status: "active" },
        { title: "Fundraising", description: "Funding starts post-verification.", date: "TBD", status: "pending" }
      ];
      const gallery = [
        "https://images.unsplash.com/photo-1666545743813-e692fb2b2430?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkcnklMjBmYXJtJTIwbGFuZCUyMGluZGlhfGVufDF8fHx8MTc4MTU0NzI4OHww&ixlib=rb-4.1.0&q=80&w=1080",
        "https://images.unsplash.com/photo-1681226298721-88cdb4096e5f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBhZ3JpY3VsdHVyZSUyMGZpZWxkc3xlbnwxfHx8fDE3ODE1NDcyODh8MA&ixlib=rb-4.1.0&q=80&w=1080"
      ];

      // Generate secure verification token and 24 hours expiry
      const token = crypto.randomBytes(32).toString('hex');
      const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      const { rows } = await pool.query(`
        INSERT INTO farmers (name, age, district, village, crop, disaster, goal, raised, land_area, damage, image, story, breakdown, gallery, timeline, verified, farmer_phone, requested_amount, video_proof, image_proofs, location_link, status, verification_token, token_expiry, token_used)
        VALUES ($1, $2, $3, $4, $5, $6, 0, 0, $7, $8, $9, $10, $11, $12, $13, false, $14, $15, $16, $17, $18, 'Farmer Contact Pending', $19, $20, false)
        RETURNING *
      `, [
        f.name, f.age, f.district, f.village, f.crop, f.disaster, f.landArea, f.damage, f.image, f.story,
        JSON.stringify(f.breakdown), JSON.stringify(gallery), JSON.stringify(timeline),
        f.farmerPhone || "", f.requestedAmount || 0, f.videoProof || null, JSON.stringify(f.imageProofs || []),
        f.locationLink || "", token, expiry
      ]);

      const insertedFarmer = mapFarmerRow(rows[0]);

      // Construct verification link
      const protocol = req.headers['x-forwarded-proto'] || 'http';
      const host = req.headers.host || 'localhost:5173';
      const verificationLink = `${protocol}://${host}/farmer/verify/${token}`;

      // Send WhatsApp utility message to the farmer
      if (f.farmerPhone) {
        await sendWhatsAppMessage(f.farmerPhone, "farmer_verification", [f.name, verificationLink]);
      }

      res.status(201).json(insertedFarmer);
      return;
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (error: any) {
    console.error("API error in farmers handler:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
