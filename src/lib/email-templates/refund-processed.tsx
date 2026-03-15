// Refund processed email template
import { formatINR } from "@/lib/utils";

export interface RefundProcessedProps {
  orderNumber: string;
  customerName: string;
  refundAmount: number;
}

export function RefundProcessedEmail(props: RefundProcessedProps): string {
  const { orderNumber, customerName, refundAmount } = props;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #f6f6f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f6f6; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="background-color: #7C3AED; padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">NEXIFI</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">Refund Processed</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px 40px;">
              <p style="margin: 0 0 8px; font-size: 16px; color: #333;">Hi ${customerName},</p>
              <p style="margin: 0 0 24px; font-size: 14px; color: #666; line-height: 1.6;">
                We've processed a refund for your order <strong style="color: #7C3AED;">#${orderNumber}</strong>.
              </p>

              <div style="background-color: #f9f5ff; border-radius: 8px; padding: 20px; margin-bottom: 24px; text-align: center;">
                <p style="margin: 0; font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 0.5px;">Refund Amount</p>
                <p style="margin: 8px 0 0; font-size: 28px; font-weight: 700; color: #7C3AED;">${formatINR(refundAmount)}</p>
              </div>

              <p style="margin: 0 0 8px; font-size: 14px; color: #666; line-height: 1.6;">
                The refund will be credited to your original payment method within 5-7 business days.
              </p>
              <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.6;">
                If you don't see the refund within this timeframe, please contact your bank or reach out to us.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9f9f9; border-top: 1px solid #eee; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #999;">
                NEXIFI — Next is Now<br>
                Questions? Reply to this email or contact us.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
