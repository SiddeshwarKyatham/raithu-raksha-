import type { IncomingMessage, ServerResponse } from 'http';
import cloudinary from './cloudinary.js';

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
    const { file, resourceType } = req.body || {};

    if (!file) {
      res.status(400).json({ error: "Missing required parameter: file" });
      return;
    }

    const type = resourceType === 'video' ? 'video' : 'image';
    const folder = type === 'video' ? 'rithu-raksha/videos' : 'rithu-raksha/farmers';

    // Upload to Cloudinary with optimization & compression to save storage space
    const uploadOptions: any = {
      resource_type: type,
      folder: folder,
    };

    if (type === 'image') {
      uploadOptions.transformation = [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto:good' }
      ];
    } else if (type === 'video') {
      uploadOptions.transformation = [
        { width: 1280, height: 720, crop: 'limit' },
        { quality: 'auto' }
      ];
    }

    const result = await cloudinary.uploader.upload(file, uploadOptions);

    res.status(200).json({
      secure_url: result.secure_url
    });
  } catch (error: any) {
    console.error("API error in upload handler:", error);
    res.status(500).json({ error: error.message || "Failed to upload file to Cloudinary" });
  }
}
