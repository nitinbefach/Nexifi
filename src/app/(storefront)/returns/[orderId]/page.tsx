"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle, Package, ArrowLeft } from "lucide-react";
import { RETURN_REASONS } from "@/lib/constants";
import { formatINR } from "@/lib/utils";

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
  guest_name: string;
  items: OrderItem[];
}

export default function CustomerReturnPage() {
  const params = useParams<{ orderId: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Form state
  const [selectedItemId, setSelectedItemId] = useState("");
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(params.orderId)}`);
        if (!res.ok) {
          setError("Order not found. Please check your order number.");
          return;
        }
        const data = await res.json();
        setOrder(data.order);
      } catch {
        setError("Failed to load order details.");
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [params.orderId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!selectedItemId) {
      setSubmitError("Please select an item to return.");
      return;
    }
    if (!reason) {
      setSubmitError("Please select a reason.");
      return;
    }
    if (description.length < 10) {
      setSubmitError("Please describe the issue (at least 10 characters).");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/returns/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: order!.id,
          order_item_id: selectedItemId,
          reason,
          description,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit return request");
      }

      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <Loader2 className="mx-auto size-8 animate-spin text-nexifi-orange" />
        <p className="mt-3 text-sm text-muted-foreground">Loading order details...</p>
      </div>
    );
  }

  // Error state
  if (error || !order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-sm text-red-600">{error || "Order not found."}</p>
        <Link
          href="/track-order"
          className="mt-4 inline-block text-sm font-medium text-nexifi-orange hover:underline"
        >
          Back to Track Order
        </Link>
      </div>
    );
  }

  // Order not delivered
  if (order.status !== "delivered") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <Package className="mx-auto size-12 text-gray-400" />
        <h2 className="mt-4 text-lg font-semibold">Return Not Available</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Returns can only be requested for delivered orders. Your order status is currently{" "}
          <span className="font-medium">{order.status}</span>.
        </p>
        <Link
          href={`/track-order?order=${encodeURIComponent(order.order_number)}`}
          className="mt-4 inline-block text-sm font-medium text-nexifi-orange hover:underline"
        >
          Track Your Order
        </Link>
      </div>
    );
  }

  // Success state
  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="size-10 text-green-600" />
        </div>
        <h2 className="mt-5 text-2xl font-bold">Return Request Submitted</h2>
        <p className="mt-2 text-muted-foreground">
          We have received your return request for order {order.order_number}.
          Our team will review it and get back to you shortly.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href={`/track-order?order=${encodeURIComponent(order.order_number)}`}
            className="rounded-lg border border-nexifi-orange px-8 py-2.5 text-sm font-semibold text-nexifi-orange transition-colors hover:bg-nexifi-orange/5"
          >
            Track Order
          </Link>
          <Link
            href="/products"
            className="rounded-lg bg-nexifi-orange px-8 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-nexifi-orange-dark"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-16">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/track-order?order=${encodeURIComponent(order.order_number)}`}
          className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Request a Return</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Order {order.order_number}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {/* Select Item */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Select Item to Return
          </label>
          <div className="mt-2 space-y-2">
            {order.items?.map((item) => (
              <label
                key={item.id}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                  selectedItemId === item.id
                    ? "border-nexifi-orange bg-orange-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="return_item"
                  value={item.id}
                  checked={selectedItemId === item.id}
                  onChange={() => setSelectedItemId(item.id)}
                  className="size-4 accent-nexifi-orange"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.product_name}</p>
                  <p className="text-xs text-muted-foreground">
                    Qty: {item.quantity} x {formatINR(item.unit_price)}
                  </p>
                </div>
                <span className="text-sm font-medium">{formatINR(item.total_price)}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Reason for Return
          </label>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mt-1 w-full rounded-lg border px-4 py-2.5 text-sm focus:border-nexifi-orange focus:outline-none focus:ring-1 focus:ring-nexifi-orange"
          >
            <option value="">Select a reason...</option>
            {RETURN_REASONS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Describe the Issue
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Please describe the issue in detail (min 10 characters)..."
            className="mt-1 w-full rounded-lg border px-4 py-2.5 text-sm focus:border-nexifi-orange focus:outline-none focus:ring-1 focus:ring-nexifi-orange"
          />
          <p className="mt-1 text-xs text-gray-400">
            {description.length}/10 characters minimum
          </p>
        </div>

        {/* Error */}
        {submitError && (
          <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{submitError}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-nexifi-orange px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-nexifi-orange-dark disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : null}
          Submit Return Request
        </button>
      </form>
    </div>
  );
}
