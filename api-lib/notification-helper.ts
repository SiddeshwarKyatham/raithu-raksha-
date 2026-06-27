/**
 * Sends a WhatsApp template message using Meta Cloud API.
 * [DISABLED] Immediately returns success.
 */
export async function sendWhatsAppMessage(to: string, templateName: string, bodyParameters: any[]) {
  // Directly bypass and return success
  return { success: true, bypassed: true };
}

/**
 * Sends a donation receipt email via Resend API.
 * [DISABLED] Immediately returns success.
 */
export async function sendEmailReceipt(
  to: string,
  donorName: string,
  amount: number,
  transactionId: string,
  farmerName: string
) {
  // Directly bypass and return success
  return { success: true, bypassed: true };
}
