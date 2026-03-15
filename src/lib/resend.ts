// Resend email client + send helpers
import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);
export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "orders@nexifi.com";

interface SendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an email using Resend with HTML content
 */
export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<SendResult> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[Resend] API key not configured — skipping email send");
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `NEXIFI <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("[Resend] Send failed:", error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[Resend] Send error:", message);
    return { success: false, error: message };
  }
}
