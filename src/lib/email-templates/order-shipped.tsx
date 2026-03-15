// Order shipped email template

export interface OrderShippedProps {
  orderNumber: string;
  customerName: string;
  trackingUrl: string;
  courierName?: string;
  awbNumber?: string;
}

export function OrderShippedEmail(props: OrderShippedProps): string {
  const { orderNumber, customerName, trackingUrl, courierName, awbNumber } = props;
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://nexifi.vercel.app";

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
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">Your Order is on its way!</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px 40px;">
              <p style="margin: 0 0 8px; font-size: 16px; color: #333;">Hi ${customerName},</p>
              <p style="margin: 0 0 24px; font-size: 14px; color: #666; line-height: 1.6;">
                Great news! Your order <strong style="color: #7C3AED;">#${orderNumber}</strong> has been shipped and is on its way to you.
              </p>

              <!-- Tracking Info -->
              <div style="background-color: #f9f5ff; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <p style="margin: 0 0 4px; font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Shipping Details</p>
                ${courierName ? `<p style="margin: 8px 0 0; font-size: 14px; color: #333;"><strong>Courier:</strong> ${courierName}</p>` : ""}
                ${awbNumber ? `<p style="margin: 4px 0 0; font-size: 14px; color: #333;"><strong>AWB:</strong> ${awbNumber}</p>` : ""}
              </div>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${trackingUrl || `${APP_URL}/track-order`}" style="display: inline-block; background-color: #7C3AED; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-size: 14px; font-weight: 600;">
                      Track Your Order
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0; font-size: 13px; color: #999; text-align: center;">
                Estimated delivery: 3-7 business days
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
