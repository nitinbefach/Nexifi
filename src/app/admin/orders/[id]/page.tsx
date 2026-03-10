import { getAdminOrderById } from "@/lib/supabase/admin-queries";
import { formatINR } from "@/lib/utils";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import OrderStatusUpdater from "./order-status-updater";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { order } = await getAdminOrderById(id);

  if (!order) notFound();

  const shipping = order.shipping_address as {
    full_name: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    pincode: string;
  };

  return (
    <div>
      <Link
        href="/admin/orders"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="size-4" />
        Back to Orders
      </Link>

      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-bold text-gray-900">
          Order {order.order_number}
        </h2>
        <OrderStatusBadge status={order.status} />
      </div>
      <p className="mt-1 text-sm text-gray-500">
        Placed on{" "}
        {new Date(order.created_at).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Items */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-sm font-semibold text-gray-900">Order Items</h3>
            <div className="mt-3 divide-y">
              {order.items?.map(
                (item: {
                  id: string;
                  product_name: string;
                  quantity: number;
                  unit_price: number;
                  total_price: number;
                }) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.product_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity} x {formatINR(item.unit_price)}
                      </p>
                    </div>
                    <span className="text-sm font-medium">
                      {formatINR(item.total_price)}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Customer & Shipping */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-sm font-semibold text-gray-900">
              Customer & Shipping
            </h3>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-gray-500">Customer</p>
                <p className="mt-1 text-sm">{order.guest_name}</p>
                <p className="text-sm text-gray-600">{order.guest_email}</p>
                <p className="text-sm text-gray-600">{order.guest_phone}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">
                  Shipping Address
                </p>
                <p className="mt-1 text-sm">
                  {shipping.full_name}
                  <br />
                  {shipping.address_line1}
                  {shipping.address_line2 ? `, ${shipping.address_line2}` : ""}
                  <br />
                  {shipping.city}, {shipping.state} - {shipping.pincode}
                  <br />
                  Phone: {shipping.phone}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Status Update */}
          <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />

          {/* Order Summary */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-sm font-semibold text-gray-900">
              Order Summary
            </h3>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatINR(order.subtotal)}</span>
              </div>
              {order.discount_amount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>
                    Discount
                    {order.coupon_code ? ` (${order.coupon_code})` : ""}
                  </span>
                  <span>-{formatINR(order.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>
                  {order.shipping_charge === 0
                    ? "Free"
                    : formatINR(order.shipping_charge)}
                </span>
              </div>
              {order.cod_charge > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>COD Charge</span>
                  <span>{formatINR(order.cod_charge)}</span>
                </div>
              )}
              {order.gst_amount > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>GST</span>
                  <span>{formatINR(order.gst_amount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 font-bold">
                <span>Total</span>
                <span className="text-nexifi-orange">
                  {formatINR(order.total_amount)}
                </span>
              </div>
              <div className="mt-2 pt-2 text-xs text-gray-500">
                Payment:{" "}
                {order.payment_method === "cod"
                  ? "Cash on Delivery"
                  : "Online (PhonePe/UPI)"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
