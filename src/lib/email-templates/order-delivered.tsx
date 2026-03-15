// Order delivered email template

export interface OrderDeliveredProps {
  orderNumber: string;
  customerName: string;
}

export function OrderDeliveredEmail(props: OrderDeliveredProps): string {
  const { orderNumber, customerName } = props;
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
            <td style="background-color: #16a34a; padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">NEXIFI</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">Order Delivered!</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px 40px;">
              <p style="margin: 0 0 8px; font-size: 16px; color: #333;">Hi ${customerName},</p>
              <p style="margin: 0 0 24px; font-size: 14px; color: #666; line-height: 1.6;">
                Your order <strong style="color: #16a34a;">#${orderNumber}</strong> has been delivered successfully. We hope you enjoy your purchase!
              </p>

              <div style="background-color: #f0fdf4; border-radius: 8px; padding: 20px; margin-bottom: 24px; text-align: center;">
                <p style="margin: 0; font-size: 32px;">🎉</p>
                <p style="margin: 8px 0 0; font-size: 14px; color: #16a34a; font-weight: 600;">Enjoy your new products!</p>
              </div>

              <p style="margin: 0 0 24px; font-size: 14px; color: #666; line-height: 1.6;">
                If you have any issues with your order, you can request a return within 7 days of delivery.
              </p>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${APP_URL}/products" style="display: inline-block; background-color: #7C3AED; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-size: 14px; font-weight: 600;">
                      Continue Shopping
                    </a>
                  </td>
                </tr>
              </table>
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
