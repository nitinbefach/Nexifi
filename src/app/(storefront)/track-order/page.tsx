"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Package, Loader2 } from "lucide-react";
import { formatINR } from "@/lib/utils";
import OrderTimeline from "@/components/storefront/OrderTimeline";

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  subtotal: number;
  discount_amount: number;
  shipping_charge: number;
  cod_charge: number;
  gst_amount: number;
  total_amount: number;
  payment_method: string;
  coupon_code: string | null;
  guest_name: string;
  shipping_address: {
    full_name: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="size-8 animate-spin text-nexifi-orange" />
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get("order") || "");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const fetchOrder = async (num: string) => {
    const trimmed = num.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");
    setOrder(null);
    setSearched(true);

    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(trimmed)}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError("Order not found. Please check your order number and try again.");
        } else {
          setError("Something went wrong. Please try again.");
        }
        return;
      }
      const data = await res.json();
      setOrder(data.order);
    } catch {
      setError("Failed to fetch order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch if order number is in URL
  useEffect(() => {
    const orderParam = searchParams.get("order");
    if (orderParam) {
      setOrderNumber(orderParam);
      fetchOrder(orderParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(orderNumber);
  };

  return (
    <div className="animate-fade-in mx-auto max-w-2xl px-4 py-10 sm:py-16">
      <div className="text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-nexifi-orange/10 sm:size-20">
          <Package className="size-8 text-nexifi-orange sm:size-10" />
        </div>
        <h1 className="mt-4 text-xl font-bold sm:text-2xl md:text-3xl">Track Your Order</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Enter your order number to check the current status.
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit} className="mt-8">
        <div className="flex gap-2">
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="e.g. ORD-20260310-00001"
            className="flex-1 rounded-xl border bg-background px-4 py-3 text-sm focus:border-nexifi-orange focus:outline-none focus:ring-2 focus:ring-nexifi-orange/20"
          />
          <button
            type="submit"
            disabled={loading || !orderNumber.trim()}
            className="flex items-center gap-2 rounded-xl bg-nexifi-orange px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-nexifi-orange-dark disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Search className="size-4" />
            )}
            Track
          </button>
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
          {error}
        </div>
      )}

      {/* No results */}
      {searched && !loading && !error && !order && (
        <div className="mt-6 text-center text-sm text-muted-foreground">
          No order found.
        </div>
      )}

      {/* Order Details */}
      {order && (
        <div className="mt-8 space-y-5">
          {/* Order Number & Status */}
          <div className="rounded-2xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Order Number</p>
                <p className="text-lg font-bold text-nexifi-orange">
                  {order.order_number}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-lg font-bold">{formatINR(order.total_amount)}</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-2xl border bg-card p-5">
            <h2 className="mb-4 text-sm font-semibold">Order Status</h2>
            <OrderTimeline
              currentStatus={order.status}
              createdAt={order.created_at}
              updatedAt={order.updated_at}
            />
          </div>

          {/* Items */}
          <div className="rounded-2xl border bg-card p-5">
            <h2 className="text-sm font-semibold">Items</h2>
            <ul className="mt-3 divide-y">
              {order.items?.map((item) => (
                <li key={item.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-medium">{item.product_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity} × {formatINR(item.unit_price)}
                    </p>
                  </div>
                  <span className="text-sm font-medium">
                    {formatINR(item.total_price)}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Summary */}
          <div className="rounded-2xl border bg-card p-5">
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
          {order.shipping_address && (
            <div className="rounded-2xl border bg-card p-5">
              <h2 className="text-sm font-semibold">Shipping To</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {order.shipping_address.full_name}<br />
                {order.shipping_address.address_line1}
                {order.shipping_address.address_line2 ? `, ${order.shipping_address.address_line2}` : ""}<br />
                {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
              </p>
              <p className="mt-2 text-sm">
                <span className="font-medium">Payment:</span>{" "}
                <span className="text-muted-foreground">
                  {order.payment_method === "cod" ? "Cash on Delivery" : "Online Payment"}
                </span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
