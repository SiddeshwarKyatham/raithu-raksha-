/**
 * Sends a WhatsApp template message using Meta Cloud API.
 * If credentials are not set, it simulates the send in logs.
 */
export async function sendWhatsAppMessage(to: string, templateName: string, bodyParameters: any[]) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  // Format phone number to E.164 standard (e.g. adding 91 prefix for India if 10 digits)
  let formattedPhone = to.trim().replace(/\D/g, '');
  if (formattedPhone.length === 10) {
    formattedPhone = '91' + formattedPhone;
  }

  const logMessage = `[WhatsApp Meta Cloud API Sandbox Log]
    Recipient: +${formattedPhone}
    Template: ${templateName}
    Body Parameters: ${JSON.stringify(bodyParameters)}`;

  if (!token || !phoneNumberId) {
    console.log(`\n=== WHATSAPP MOCK SIMULATION ===\n${logMessage}\n=================================\n`);
    return { mock: true, success: true };
  }

  try {
    const url = `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: formattedPhone,
        type: "template",
        template: {
          name: templateName,
          language: {
            code: "en_US"
          },
          components: [
            {
              "type": "body",
              "parameters": bodyParameters.map(param => ({
                "type": "text",
                "text": String(param)
              }))
            }
          ]
        }
      })
    });

    const data = await res.json();
    if (!res.ok) {
      console.warn("Meta Cloud API returned an error:", data);
      // Fallback log
      console.log(`\n=== WHATSAPP FALLBACK (Meta API Error) ===\n${logMessage}\n==========================================\n`);
      return { success: false, error: data };
    }

    console.log(`Successfully sent Meta API WhatsApp message to +${formattedPhone}`);
    return { success: true, response: data };
  } catch (error) {
    console.error("Error communicating with WhatsApp Meta API:", error);
    console.log(`\n=== WHATSAPP FALLBACK (Network Exception) ===\n${logMessage}\n============================================\n`);
    return { success: false, error };
  }
}

/**
 * Sends a donation receipt email via Resend API.
 * If credentials are not set, it simulates the send in logs.
 */
export async function sendEmailReceipt(
  to: string,
  donorName: string,
  amount: number,
  transactionId: string,
  farmerName: string
) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = "onboarding@resend.dev"; // Default sandbox sender for unverified domains

  const htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: sans-serif; line-height: 1.5; color: #1c1c1e; }
          .receipt { border: 1px solid #eae5db; border-radius: 12px; padding: 24px; max-width: 500px; margin: 20px auto; background-color: #fdfbf7; }
          .header { text-align: center; border-bottom: 2px solid #1a3627; padding-bottom: 12px; }
          .title { font-size: 22px; font-weight: bold; color: #1a3627; }
          .amount { font-size: 32px; font-weight: bold; color: #1a3627; text-align: center; margin: 20px 0; }
          .details { width: 100%; border-collapse: collapse; margin-top: 15px; }
          .details td { padding: 8px 0; border-bottom: 1px solid rgba(0,0,0,0.05); font-size: 14px; }
          .label { color: #5c4033; font-weight: 500; }
          .value { text-align: right; font-weight: bold; }
          .footer { text-align: center; font-size: 11px; color: #5c4033; margin-top: 24px; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <span class="title">Rythu Raksha Foundation</span>
            <p style="margin:4px 0 0 0;font-size:12px;color:#5c4033;">by Nava Nirman Foundation</p>
          </div>
          <div class="amount">₹${amount.toLocaleString()}</div>
          <p style="text-align:center;font-size:14px;margin-top:-10px;">Donation Successful</p>
          
          <table class="details">
            <tr>
              <td class="label">Donor Name</td>
              <td class="value">${donorName}</td>
            </tr>
            <tr>
              <td class="label">Supported Farmer</td>
              <td class="value">${farmerName}</td>
            </tr>
            <tr>
              <td class="label">Transaction ID</td>
              <td class="value" style="font-family:monospace;">${transactionId}</td>
            </tr>
            <tr>
              <td class="label">Date</td>
              <td class="value">${new Date().toLocaleDateString()}</td>
            </tr>
          </table>
          
          <div class="footer">
            <p>Your support directly funds verification, seeds, and equipment for distressed farmers.</p>
            <p>© ${new Date().getFullYear()} Rythu Raksha NGO. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const logMessage = `[Resend Email API Sandbox Log]
    Recipient Email: ${to}
    Subject: Donation Receipt - Rythu Raksha Support for ${farmerName}
    Donor: ${donorName}
    Amount: ₹${amount}`;

  if (!apiKey) {
    console.log(`\n=== RESEND EMAIL MOCK SIMULATION ===\n${logMessage}\n=====================================\n`);
    return { mock: true, success: true };
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `Rythu Raksha <${fromEmail}>`,
        to: [to],
        subject: `Donation Receipt - Rythu Raksha Support for ${farmerName}`,
        html: htmlContent
      })
    });

    const data = await res.json();
    if (!res.ok) {
      console.warn("Resend API returned an error:", data);
      console.log(`\n=== RESEND FALLBACK (Resend API Error) ===\n${logMessage}\n==========================================\n`);
      return { success: false, error: data };
    }

    console.log(`Successfully sent Resend email receipt to ${to}`);
    return { success: true, response: data };
  } catch (error) {
    console.error("Error communicating with Resend API:", error);
    console.log(`\n=== RESEND FALLBACK (Network Exception) ===\n${logMessage}\n============================================\n`);
    return { success: false, error };
  }
}
