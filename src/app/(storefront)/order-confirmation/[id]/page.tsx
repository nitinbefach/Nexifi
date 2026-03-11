import React from "react";
import Link from "next/link";
import { CheckCircle, Package, Truck, Clock } from "lucide-react";
import { formatINR } from "@/lib/utils";
import { supabaseAdmin } from "@/lib/supabase/admin";

interface OrderConfirmationPageProps {
  params: Promise<{ id: string }>;
}

async function getOrder(orderNumber: string) {
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderNumber);
  const column = isUuid ? "id" : "order_number";

  const { data: order } = await supabaseAdmin
    .from("orders")
    .select("*, items:order_items(*)")
    .eq(column, orderNumber)
    .single();

  return order;
}

export default async function OrderConfirmationPage({
  params,
}: OrderConfirmationPageProps) {
  const { id } = await params;
  const order = await getOrder(id);

  return (
    <div className="animate-fade-in mx-auto max-w-2xl px-4 py-10 sm:py-16">
      {/* Success Icon */}
      <div className="text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30 sm:size-24">
          <CheckCircle className="size-10 text-green-600 sm:size-12" />
        </div>
        <h1 className="mt-5 text-2xl font-bold sm:text-3xl">Order Placed!</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Thank you for your purchase. Your order has been confirmed.
        </p>
      </div>

      {/* Order Number */}
      <div className="mt-8 rounded-2xl border bg-card p-5 text-center sm:p-6">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Order Number</p>
        <p className="mt-1.5 text-xl font-bold tracking-wide text-nexifi-orange sm:text-2xl">
          {order?.order_number || id}
        </p>
      </div>

      {/* Order Details (if fetched) */}
      {order && (
        <>
          {/* Items */}
          <div className="mt-5 rounded-2xl border bg-card p-5">
            <h2 className="text-sm font-semibold">Items Ordered</h2>
            <ul className="mt-3 divide-y">
              {order.items?.map((item: { id: string; product_name: string; quantity: number; unit_price: number; total_price: number }) => (
                <li key={item.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium">{item.product_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity} × {formatINR(item.unit_price)}
                    </p>
                  </div>
                  <span className="text-sm font-medium">{formatINR(item.total_price)}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Summary */}
          <div className="mt-4 rounded-2xl border bg-card p-5">
            <h2 className="text-sm font-semibold">Order Summary</h2>
            <div className="mt-3 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatINR(order.subtotal)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount{order.coupon_code ? ` (${order.coupon_code})` : ""}</span>
                  <span>-{formatINR(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className={order.shipping_charge === 0 ? "text-green-600" : ""}>
                  {order.shipping_charge === 0 ? "Free" : formatINR(order.shipping_charge)}
                </span>
              </div>
              {order.cod_charge > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">COD Charge</span>
                  <span>{formatINR(order.cod_charge)}</span>
                </div>
              )}
              {order.gst_amount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GST</span>
                  <span>{formatINR(order.gst_amount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 font-bold">
                <span>Total</span>
                <span className="text-nexifi-orange">{formatINR(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="mt-4 rounded-2xl border bg-card p-5">
            <h2 className="text-sm font-semibold">Shipping To</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {order.shipping_address.full_name}<br />
              {order.shipping_address.address_line1}
              {order.shipping_address.address_line2 ? `, ${order.shipping_address.address_line2}` : ""}<br />
              {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}<br />
              Phone: {order.shipping_address.phone}
            </p>
            <p className="mt-2 text-sm">
              <span className="font-medium">Payment:</span>{" "}
              <span className="text-muted-foreground">
                {order.payment_method === "cod" ? "Cash on Delivery" : "PhonePe / UPI"}
              </span>
            </p>
          </div>
        </>
      )}

      {/* What's Next */}
      <div className="mt-6 rounded-2xl bg-muted/30 p-5">
        <h2 className="font-semibold">What&apos;s Next?</h2>
        <ul className="mt-3 space-y-2.5">
          <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
            <Clock className="mt-0.5 size-4 shrink-0 text-nexifi-orange" />
            You will receive an order confirmation email shortly.
          </li>
          <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
            <Package className="mt-0.5 size-4 shrink-0 text-nexifi-orange" />
            We will notify you when your order is being processed.
          </li>
          <li className="flex items-start gap-2.5 text-sm text-muted-foreground">
            <Truck className="mt-0.5 size-4 shrink-0 text-nexifi-orange" />
            Expected delivery in 3-7 business days.
          </li>
        </ul>
      </div>

      {/* CTA */}
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        {order && (
          <Link
            href={`/track-order?order=${encodeURIComponent(order.order_number)}`}
            className="rounded-xl border border-nexifi-orange px-8 py-2.5 text-sm font-semibold text-nexifi-orange transition-colors hover:bg-nexifi-orange/5"
          >
            Track Your Order
          </Link>
        )}
        <Link
          href="/products"
          className="rounded-xl bg-nexifi-orange px-8 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-nexifi-orange-dark"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
