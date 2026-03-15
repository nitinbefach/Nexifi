// Order confirmation email template
import { formatINR } from "@/lib/utils";

interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface ShippingAddress {
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderConfirmedProps {
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  subtotal: number;
  discountAmount: number;
  shippingCharge: number;
  codCharge: number;
  gstAmount: number;
  paymentMethod: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
}

export function OrderConfirmedEmail(props: OrderConfirmedProps): string {
  const {
    orderNumber,
    customerName,
    totalAmount,
    subtotal,
    discountAmount,
    shippingCharge,
    codCharge,
    gstAmount,
    paymentMethod,
    items,
    shippingAddress,
  } = props;

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://nexifi.vercel.app";

  const itemRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #333;">
          ${item.product_name}
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #666; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #333; text-align: right;">
          ${formatINR(item.total_price)}
        </td>
      </tr>`
    )
    .join("");

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
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">NEXIFI</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">Order Confirmed</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px 40px;">
              <p style="margin: 0 0 8px; font-size: 16px; color: #333;">Hi ${customerName},</p>
              <p style="margin: 0 0 24px; font-size: 14px; color: #666; line-height: 1.6;">
                Thank you for your order! We've received your order <strong style="color: #7C3AED;">#${orderNumber}</strong> and it's being processed.
              </p>

              <!-- Order Items -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr style="background-color: #f9f9f9;">
                  <th style="padding: 10px 0; font-size: 12px; color: #888; text-align: left; text-transform: uppercase; letter-spacing: 0.5px;">Item</th>
                  <th style="padding: 10px 0; font-size: 12px; color: #888; text-align: center; text-transform: uppercase; letter-spacing: 0.5px;">Qty</th>
                  <th style="padding: 10px 0; font-size: 12px; color: #888; text-align: right; text-transform: uppercase; letter-spacing: 0.5px;">Amount</th>
                </tr>
                ${itemRows}
              </table>

              <!-- Totals -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding: 4px 0; font-size: 14px; color: #666;">Subtotal</td>
                  <td style="padding: 4px 0; font-size: 14px; color: #333; text-align: right;">${formatINR(subtotal)}</td>
                </tr>
                ${discountAmount > 0 ? `<tr>
                  <td style="padding: 4px 0; font-size: 14px; color: #16a34a;">Discount</td>
                  <td style="padding: 4px 0; font-size: 14px; color: #16a34a; text-align: right;">-${formatINR(discountAmount)}</td>
                </tr>` : ""}
                <tr>
                  <td style="padding: 4px 0; font-size: 14px; color: #666;">Shipping</td>
                  <td style="padding: 4px 0; font-size: 14px; color: ${shippingCharge === 0 ? "#16a34a" : "#333"}; text-align: right;">${shippingCharge === 0 ? "Free" : formatINR(shippingCharge)}</td>
                </tr>
                ${codCharge > 0 ? `<tr>
                  <td style="padding: 4px 0; font-size: 14px; color: #666;">COD Charge</td>
                  <td style="padding: 4px 0; font-size: 14px; color: #333; text-align: right;">${formatINR(codCharge)}</td>
                </tr>` : ""}
                <tr>
                  <td style="padding: 4px 0; font-size: 14px; color: #666;">GST</td>
                  <td style="padding: 4px 0; font-size: 14px; color: #333; text-align: right;">${formatINR(gstAmount)}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 0 4px; font-size: 16px; font-weight: 700; color: #333; border-top: 2px solid #eee;">Total</td>
                  <td style="padding: 12px 0 4px; font-size: 16px; font-weight: 700; color: #7C3AED; text-align: right; border-top: 2px solid #eee;">${formatINR(totalAmount)}</td>
                </tr>
              </table>

              <!-- Payment Method -->
              <div style="background-color: #f9f5ff; border-radius: 8px; padding: 12px 16px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 13px; color: #7C3AED; font-weight: 600;">
                  Payment: ${paymentMethod === "cod" ? "Cash on Delivery" : "PhonePe / UPI (Paid)"}
                </p>
              </div>

              <!-- Shipping Address -->
              <div style="background-color: #f9f9f9; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <p style="margin: 0 0 8px; font-size: 13px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Shipping To</p>
                <p style="margin: 0; font-size: 14px; color: #333; line-height: 1.6;">
                  ${shippingAddress.full_name}<br>
                  ${shippingAddress.address_line1}${shippingAddress.address_line2 ? `<br>${shippingAddress.address_line2}` : ""}<br>
                  ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}<br>
                  Phone: ${shippingAddress.phone}
                </p>
              </div>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${APP_URL}/track-order" style="display: inline-block; background-color: #7C3AED; color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-size: 14px; font-weight: 600;">
                      Track Your Order
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
