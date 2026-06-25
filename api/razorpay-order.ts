import type { IncomingMessage, ServerResponse } from 'http';

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
    const { amount, farmerId } = req.body || {};

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      res.status(400).json({ error: "Invalid donation amount." });
      return;
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    const amountInPaise = Math.round(parseFloat(amount) * 100);

    // If Razorpay keys are placeholders or missing, fall back to mock order generation immediately
    const isPlaceholder = !keyId || !keySecret || keyId.includes("placeholder") || keyId.includes("test_RythuRaksha");

    if (isPlaceholder) {
      console.log("Using Mock Payment Gateway: Razorpay test keys are placeholders.");
      res.status(200).json({
        key_id: keyId || "rzp_test_placeholder",
        order_id: `order_mock_${Math.random().toString(36).substring(2, 11)}`,
        amount: amountInPaise,
        is_mock: true
      });
      return;
    }

    // Try to create order with Razorpay REST API
    try {
      const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: 'INR',
          receipt: `receipt_farmer_${farmerId || 'unknown'}_${Date.now()}`
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Razorpay API Error: ${response.status} - ${errorText}`);
      }

      const orderData = await response.json();
      
      res.status(200).json({
        key_id: keyId,
        order_id: orderData.id,
        amount: orderData.amount,
        is_mock: false
      });

    } catch (apiError: any) {
      console.warn("Razorpay API call failed, falling back to mock mode:", apiError.message);
      // Fallback in case of network issue or key verification failure on Razorpay servers
      res.status(200).json({
        key_id: keyId,
        order_id: `order_mock_${Math.random().toString(36).substring(2, 11)}`,
        amount: amountInPaise,
        is_mock: true
      });
    }

  } catch (error: any) {
    console.error("API error in razorpay-order handler:", error);
    res.status(500).json({ error: error.message || "Failed to initialize payment order" });
  }
}
