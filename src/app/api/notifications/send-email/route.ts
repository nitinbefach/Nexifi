import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/resend";
import { OrderConfirmedEmail } from "@/lib/email-templates/order-confirmed";
import { OrderShippedEmail } from "@/lib/email-templates/order-shipped";
import { OrderDeliveredEmail } from "@/lib/email-templates/order-delivered";
import { RefundProcessedEmail } from "@/lib/email-templates/refund-processed";
import { LowStockAlertEmail } from "@/lib/email-templates/low-stock-alert";

type EmailType =
  | "order_confirmation"
  | "order_shipped"
  | "order_delivered"
  | "refund_processed"
  | "low_stock_alert";

export async function POST(request: NextRequest) {
  try {
    const { type, orderId, to, data } = (await request.json()) as {
      type: EmailType;
      orderId?: string;
      to: string;
      data?: Record<string, unknown>;
    };

    if (!type || !to) {
      return NextResponse.json(
        { error: "Missing required fields: type, to" },
        { status: 400 }
      );
    }

    let subject = "";
    let html = "";

    // For order-based emails, fetch order details
    if (orderId && ["order_confirmation", "order_shipped", "order_delivered", "refund_processed"].includes(type)) {
      const { data: order } = await supabaseAdmin
        .from("orders")
        .select("*, order_items:order_items(*)")
        .eq("id", orderId)
        .single();

      if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      const shippingAddr =
        typeof order.shipping_address === "string"
          ? JSON.parse(order.shipping_address)
          : order.shipping_address;

      switch (type) {
        case "order_confirmation":
          subject = `Order Confirmed — #${order.order_number} | NEXIFI`;
          html = OrderConfirmedEmail({
            orderNumber: order.order_number,
            customerName: order.guest_name,
            totalAmount: order.total_amount,
            subtotal: order.subtotal,
            discountAmount: order.discount_amount,
            shippingCharge: order.shipping_charge,
            codCharge: order.cod_charge || 0,
            gstAmount: order.gst_amount,
            paymentMethod: order.payment_method,
            items: order.order_items || [],
            shippingAddress: shippingAddr,
          });
          break;

        case "order_shipped":
          subject = `Order Shipped — #${order.order_number} | NEXIFI`;
          html = OrderShippedEmail({
            orderNumber: order.order_number,
            customerName: order.guest_name,
            trackingUrl: order.tracking_url || "",
            courierName: (data?.courierName as string) || undefined,
            awbNumber: (data?.awbNumber as string) || order.tracking_number || undefined,
          });
          break;

        case "order_delivered":
          subject = `Order Delivered — #${order.order_number} | NEXIFI`;
          html = OrderDeliveredEmail({
            orderNumber: order.order_number,
            customerName: order.guest_name,
          });
          break;

        case "refund_processed":
          subject = `Refund Processed — #${order.order_number} | NEXIFI`;
          html = RefundProcessedEmail({
            orderNumber: order.order_number,
            customerName: order.guest_name,
            refundAmount: (data?.refundAmount as number) || order.total_amount,
          });
          break;
      }
    } else if (type === "low_stock_alert") {
      subject = `Low Stock Alert: ${data?.productName || "Unknown Product"} | NEXIFI`;
      html = LowStockAlertEmail({
        productName: (data?.productName as string) || "Unknown Product",
        currentStock: (data?.currentStock as number) || 0,
        sku: (data?.sku as string) || undefined,
      });
    } else {
      return NextResponse.json(
        { error: `Unsupported email type: ${type}` },
        { status: 400 }
      );
    }

    // Send the email
    const result = await sendEmail(to, subject, html);

    // Update notification log if orderId exists
    if (orderId) {
      await supabaseAdmin
        .from("notification_log")
        .update({ status: result.success ? "sent" : "failed" })
        .eq("order_id", orderId)
        .eq("type", type);
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to send email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error("[Send Email] Error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
