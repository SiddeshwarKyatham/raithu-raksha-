import type { IncomingMessage, ServerResponse } from 'http';
import crypto from 'crypto';
import { pool } from '../api-lib/db.js';
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

export default async function handler(req: ExtendedRequest, res: ExtendedResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).send('OK');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  const { farmerId } = req.body || {};
  if (!farmerId) {
    res.status(400).json({ error: "farmerId is required." });
    return;
  }

  try {
    const { rows } = await pool.query('SELECT * FROM farmers WHERE id = $1', [parseInt(farmerId)]);
    if (rows.length === 0) {
      res.status(404).json({ error: "Farmer not found." });
      return;
    }

    const farmer = rows[0];

    // Generate new token and 24 hours expiry
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Update in DB
    await pool.query(`
      UPDATE farmers
      SET verification_token = $1, token_expiry = $2, token_used = false, status = 'Farmer Contact Pending'
      WHERE id = $3
    `, [token, expiry, farmer.id]);

    // Construct link
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host || 'localhost:5173';
    const verificationLink = `${protocol}://${host}/farmer/verify/${token}`;

    res.status(200).json({ success: true, message: "Verification link successfully regenerated." });

  } catch (error: any) {
    console.error("Error in resend-verification handler:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
