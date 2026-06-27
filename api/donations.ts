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

export default async function handler(req: ExtendedRequest, res: ExtendedResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).send('OK');
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { rows } = await pool.query('SELECT * FROM donations ORDER BY id DESC');
    
    const mapped = rows.map((row: any) => ({
      id: row.id,
      farmerId: row.farmer_id,
      farmerName: row.farmer_name,
      donorName: row.donor_name,
      amount: row.amount,
      message: row.message,
      date: row.date
    }));

    res.status(200).json(mapped);
  } catch (error: any) {
    console.error("API error in donations handler:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
