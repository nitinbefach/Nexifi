import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { checkOrderStatus } from "@/lib/phonepe";
import { sendEmail } from "@/lib/resend";
import { OrderConfirmedEmail } from "@/lib/email-templates/order-confirmed";

/**
 * PhonePe redirects the customer here after payment (v2 Standard Checkout).
 * We verify the payment status and redirect to order confirmation or failure page.
 */
export async function GET(request: NextRequest) {
  const merchantOrderId = request.nextUrl.searchParams.get("orderId");
  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!merchantOrderId) {
    return NextResponse.redirect(`${APP_URL}/checkout?error=missing_txn`);
  }

  try {
    // 1. Find the order by merchantOrderId stored in phonepe_transaction_id
    const { data: order } = await supabaseAdmin
      .from("orders")
      .select("*, order_items:order_items(*)")
      .eq("phonepe_transaction_id", merchantOrderId)
      .single();

    if (!order) {
      return NextResponse.redirect(`${APP_URL}/checkout?error=order_not_found`);
    }

    // 2. Check payment status with PhonePe v2 API
    const result = await checkOrderStatus(merchantOrderId);

    if (result.success && result.state === "COMPLETED") {
      // Payment successful — update order
      await supabaseAdmin
        .from("orders")
        .update({
          payment_status: "paid",
          phonepe_payment_id: result.transactionId || null,
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
        ).catch((err) => console.error("[Email] Failed:", err));

        // Update notification log
        await supabaseAdmin
          .from("notification_log")
          .update({ status: "sent" })
          .eq("order_id", order.id)
          .eq("type", "order_confirmation");
      }

      return NextResponse.redirect(
        `${APP_URL}/order-confirmation/${order.order_number}`
      );
    }

    if (result.state === "PENDING") {
      // Payment still pending
      return NextResponse.redirect(
        `${APP_URL}/order-confirmation/${order.order_number}?payment=pending`
      );
    }

    // Payment failed
    await supabaseAdmin
      .from("orders")
      .update({ payment_status: "failed" })
      .eq("id", order.id);

    return NextResponse.redirect(
      `${APP_URL}/checkout?error=payment_failed&order=${order.order_number}`
    );
  } catch (error) {
    console.error("PhonePe verification error:", error);
    return NextResponse.redirect(`${APP_URL}/checkout?error=verification_failed`);
  }
}
