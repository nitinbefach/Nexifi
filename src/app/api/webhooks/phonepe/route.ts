import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifyChecksum } from "@/lib/phonepe";
import { sendEmail } from "@/lib/resend";
import { OrderConfirmedEmail } from "@/lib/email-templates/order-confirmed";

/**
 * PhonePe server-to-server callback webhook.
 * This is the reliable payment confirmation — the redirect URL is a fallback.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const xVerify = request.headers.get("x-verify") || "";

    // 1. Verify checksum
    if (!verifyChecksum(xVerify, body)) {
      console.error("[PhonePe Webhook] Invalid checksum");
      return NextResponse.json({ error: "Invalid checksum" }, { status: 401 });
    }

    // 2. Parse the callback response
    const parsed = JSON.parse(body);
    const decodedResponse = JSON.parse(
      Buffer.from(parsed.response, "base64").toString("utf-8")
    );

    const merchantTransactionId =
      decodedResponse.data?.merchantTransactionId;
    const paymentState = decodedResponse.code; // PAYMENT_SUCCESS, PAYMENT_ERROR, etc.
    const transactionId = decodedResponse.data?.transactionId;

    if (!merchantTransactionId) {
      return NextResponse.json(
        { error: "Missing transaction ID" },
        { status: 400 }
      );
    }

    // 3. Find the order
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("*, order_items:order_items(*)")
      .eq("phonepe_transaction_id", merchantTransactionId)
      .single();

    if (!order) {
      console.error(
        "[PhonePe Webhook] Order not found for txn:",
        merchantTransactionId
      );
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 4. Update order based on payment state
    if (paymentState === "PAYMENT_SUCCESS") {
      // Only update if not already paid (idempotency)
      if (order.payment_status !== "paid") {
        await supabaseAdmin
          .from("orders")
          .update({
            payment_status: "paid",
            phonepe_payment_id: transactionId || null,
            status: "confirmed",
          })
          .eq("id", order.id);

        // Send confirmation email
        if (order.guest_email) {
          const shippingAddr =
            typeof order.shipping_address === "string"
              ? JSON.parse(order.shipping_address)
              : order.shipping_address;

          sendEmail(
            order.guest_email,
            `Order Confirmed — #${order.order_number} | NEXIFI`,
            OrderConfirmedEmail({
              orderNumber: order.order_number,
              customerName: order.guest_name,
              totalAmount: order.total_amount,
              subtotal: order.subtotal,
              discountAmount: order.discount_amount,
              shippingCharge: order.shipping_charge,
              codCharge: order.cod_charge || 0,
              gstAmount: order.gst_amount,
              paymentMethod: "online",
              items: order.order_items || [],
              shippingAddress: shippingAddr,
            })
          ).catch((err) => console.error("[Email] Webhook send failed:", err));

          await supabaseAdmin
            .from("notification_log")
            .update({ status: "sent" })
            .eq("order_id", order.id)
            .eq("type", "order_confirmation");
        }
      }
    } else {
      // Payment failed
      if (order.payment_status === "pending") {
        await supabaseAdmin
          .from("orders")
          .update({ payment_status: "failed" })
          .eq("id", order.id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PhonePe Webhook] Error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
