// Low stock alert email for admin

export interface LowStockAlertProps {
  productName: string;
  currentStock: number;
  sku?: string;
}

export function LowStockAlertEmail(props: LowStockAlertProps): string {
  const { productName, currentStock, sku } = props;
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
            <td style="background-color: #dc2626; padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">NEXIFI Admin</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">Low Stock Alert</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px 40px;">
              <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <p style="margin: 0 0 4px; font-size: 13px; color: #dc2626; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Low Stock Warning</p>
                <p style="margin: 8px 0 0; font-size: 16px; color: #333; font-weight: 600;">${productName}</p>
                ${sku ? `<p style="margin: 4px 0 0; font-size: 13px; color: #888;">SKU: ${sku}</p>` : ""}
                <p style="margin: 12px 0 0; font-size: 24px; font-weight: 700; color: #dc2626;">${currentStock} units remaining</p>
              </div>

              <p style="margin: 0 0 24px; font-size: 14px; color: #666; line-height: 1.6;">
                This product is running low on stock. Consider restocking to avoid stockouts.
              </p>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${APP_URL}/admin/products" style="display: inline-block; background-color: #7C3AED; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-size: 14px; font-weight: 600;">
                      Manage Products
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
                This is an automated alert from NEXIFI Admin.
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
