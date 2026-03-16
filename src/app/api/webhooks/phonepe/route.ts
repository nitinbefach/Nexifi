import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifyWebhookAuth } from "@/lib/phonepe";
import { sendEmail } from "@/lib/resend";
import { OrderConfirmedEmail } from "@/lib/email-templates/order-confirmed";

/**
 * PhonePe v2 server-to-server webhook callback.
 * Receives event-based JSON payload with SHA256(username:password) auth.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verify webhook authorization (SHA256 of username:password)
    const authHeader = request.headers.get("authorization") || "";
    if (!verifyWebhookAuth(authHeader)) {
      console.error("[PhonePe Webhook] Invalid authorization");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse the v2 webhook payload
    const body = await request.json();
    const event = body.event; // e.g. "checkout.order.completed", "checkout.order.failed"
    const payload = body.payload;

    if (!payload?.merchantOrderId) {
      return NextResponse.json(
        { error: "Missing merchantOrderId" },
        { status: 400 }
      );
    }

    const merchantOrderId = payload.merchantOrderId;
    const paymentState = payload.state; // COMPLETED, FAILED
    const transactionId = payload.paymentDetails?.[0]?.transactionId;

    // 3. Find the order
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("*, order_items:order_items(*)")
      .eq("phonepe_transaction_id", merchantOrderId)
      .single();

    if (!order) {
      console.error(
        "[PhonePe Webhook] Order not found for:",
        merchantOrderId
      );
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 4. Update order based on payment state
    if (
      (event === "checkout.order.completed" || paymentState === "COMPLETED") &&
      order.payment_status !== "paid"
    ) {
      await supabaseAdmin
        .from("orders")
        .update({
          payment_status: "paid",
          phonepe_payment_id: transactionId || null,
          status: "confirmed",
        })
        .eq("id", order.id);

      // Send confirmation email (fire and forget)
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
    } else if (
      (event === "checkout.order.failed" || paymentState === "FAILED") &&
      order.payment_status === "pending"
    ) {
      await supabaseAdmin
        .from("orders")
        .update({ payment_status: "failed" })
        .eq("id", order.id);
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
