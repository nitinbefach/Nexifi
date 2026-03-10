"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { RETURN_REASONS } from "@/lib/constants";
import { formatINR } from "@/lib/utils";

type ReturnStatus = "requested" | "approved" | "rejected" | "pickup_scheduled" | "received" | "refunded";

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface ReturnRequest {
  id: string;
  order_id: string;
  user_id: string | null;
  order_item_id: string | null;
  reason: string;
  description: string;
  images: string[] | null;
  status: ReturnStatus;
  admin_notes: string | null;
  refund_amount: number | null;
  razorpay_refund_id: string | null;
  created_at: string;
  updated_at: string;
  order: {
    order_number: string;
    guest_name: string;
    guest_email: string;
    guest_phone: string | null;
    shipping_address: {
      full_name: string;
      address_line1: string;
      address_line2?: string;
      city: string;
      state: string;
      pincode: string;
      phone: string;
    };
    items: OrderItem[];
  } | null;
}

const STATUS_OPTIONS: { value: ReturnStatus; label: string }[] = [
  { value: "requested", label: "Requested" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "pickup_scheduled", label: "Pickup Scheduled" },
  { value: "received", label: "Received" },
  { value: "refunded", label: "Refunded" },
];

const STATUS_STYLES: Record<ReturnStatus, string> = {
  requested: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  pickup_scheduled: "bg-blue-100 text-blue-800",
  received: "bg-purple-100 text-purple-800",
  refunded: "bg-gray-100 text-gray-800",
};

function getReasonLabel(reason: string): string {
  const found = RETURN_REASONS.find((r) => r.value === reason);
  return found ? found.label : reason;
}

interface Props {
  returnRequest: ReturnRequest;
}

export default function ReturnDetailClient({ returnRequest: initial }: Props) {
  const [returnReq, setReturnReq] = useState(initial);
  const [status, setStatus] = useState<ReturnStatus>(initial.status);
  const [adminNotes, setAdminNotes] = useState(initial.admin_notes || "");
  const [refundAmount, setRefundAmount] = useState(
    initial.refund_amount !== null ? String(initial.refund_amount) : ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Find the returned item from order items
  const returnedItem = returnReq.order?.items?.find(
    (item) => item.id === returnReq.order_item_id
  );

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const body: { status: string; admin_notes: string; refund_amount?: number } = {
        status,
        admin_notes: adminNotes,
      };
      if (refundAmount) {
        body.refund_amount = parseFloat(refundAmount);
      }

      const res = await fetch(`/api/admin/returns/${returnReq.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error("Failed to update");

      const data = await res.json();
      setReturnReq({ ...returnReq, ...data.returnRequest });
      setSuccess("Return request updated successfully");
      setTimeout(() => setSuccess(""), 3000);
    } catch {
      setError("Failed to update return request");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/returns"
          className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Return Request
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">
            Order {returnReq.order?.order_number || "N/A"} — {returnReq.order?.guest_name || "Unknown"}
          </p>
        </div>
        <span
          className={`ml-auto rounded-full px-3 py-1 text-xs font-medium ${
            STATUS_STYLES[returnReq.status]
          }`}
        >
          {STATUS_OPTIONS.find((s) => s.value === returnReq.status)?.label || returnReq.status}
        </span>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      )}
      {success && (
        <p className="mt-4 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-700">{success}</p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column — Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Returned Item */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-sm font-medium text-gray-700">Returned Item</h3>
            {returnedItem ? (
              <div className="mt-3 flex items-center gap-4 rounded border border-gray-100 p-3">
                <div className="flex size-16 shrink-0 items-center justify-center rounded bg-gray-100 text-xs text-gray-400">
                  {returnedItem.product_image ? (
                    <Image
                      src={returnedItem.product_image}
                      alt={returnedItem.product_name}
                      width={64}
                      height={64}
                      className="size-16 rounded object-cover"
                    />
                  ) : (
                    "IMG"
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {returnedItem.product_name}
                  </p>
                  <p className="text-xs text-gray-500">Qty: {returnedItem.quantity}</p>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  {formatINR(returnedItem.total_price)}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-gray-500">
                Item details not available.
              </p>
            )}
          </div>

          {/* Reason & Description */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-sm font-medium text-gray-700">Return Reason</h3>
            <p className="mt-2 inline-block rounded bg-orange-50 px-2 py-0.5 text-sm font-medium text-nexifi-orange">
              {getReasonLabel(returnReq.reason)}
            </p>

            <h3 className="mt-4 text-sm font-medium text-gray-700">Customer Description</h3>
            <p className="mt-2 text-sm text-gray-600">
              {returnReq.description || "No description provided."}
            </p>
          </div>

          {/* Customer Images */}
          {returnReq.images && returnReq.images.length > 0 && (
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="text-sm font-medium text-gray-700">Customer Images</h3>
              <div className="mt-3 flex flex-wrap gap-3">
                {returnReq.images.map((img, i) => (
                  <a
                    key={i}
                    href={img}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Image
                      src={img}
                      alt={`Return image ${i + 1}`}
                      width={120}
                      height={120}
                      className="size-28 rounded-lg border object-cover hover:opacity-80"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Customer Info */}
          {returnReq.order && (
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="text-sm font-medium text-gray-700">Customer Info</h3>
              <div className="mt-3 space-y-1 text-sm text-gray-600">
                <p><span className="font-medium text-gray-900">Name:</span> {returnReq.order.guest_name}</p>
                <p><span className="font-medium text-gray-900">Email:</span> {returnReq.order.guest_email}</p>
                {returnReq.order.guest_phone && (
                  <p><span className="font-medium text-gray-900">Phone:</span> {returnReq.order.guest_phone}</p>
                )}
                {returnReq.order.shipping_address && (
                  <p>
                    <span className="font-medium text-gray-900">Address:</span>{" "}
                    {returnReq.order.shipping_address.address_line1}
                    {returnReq.order.shipping_address.address_line2
                      ? `, ${returnReq.order.shipping_address.address_line2}`
                      : ""}
                    , {returnReq.order.shipping_address.city},{" "}
                    {returnReq.order.shipping_address.state} -{" "}
                    {returnReq.order.shipping_address.pincode}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column — Action Panel */}
        <div className="space-y-6">
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-sm font-medium text-gray-700">Update Status</h3>

            {/* Status Dropdown */}
            <div className="mt-3">
              <label className="block text-xs font-medium text-gray-500">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ReturnStatus)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-nexifi-orange focus:outline-none focus:ring-1 focus:ring-nexifi-orange"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Refund Amount */}
            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-500">
                Refund Amount (Rs.)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder="0.00"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-nexifi-orange focus:outline-none focus:ring-1 focus:ring-nexifi-orange"
              />
            </div>

            {/* Admin Notes */}
            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-500">Admin Notes</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
                placeholder="Internal notes about this return..."
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-nexifi-orange focus:outline-none focus:ring-1 focus:ring-nexifi-orange"
              />
            </div>

            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-nexifi-orange px-4 py-2 text-sm font-medium text-white hover:bg-nexifi-orange-dark disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Save Changes
            </button>
          </div>

          {/* Timeline Info */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-sm font-medium text-gray-700">Timeline</h3>
            <div className="mt-3 space-y-2 text-sm text-gray-600">
              <p>
                <span className="font-medium text-gray-900">Submitted:</span>{" "}
                {new Date(returnReq.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p>
                <span className="font-medium text-gray-900">Last Updated:</span>{" "}
                {new Date(returnReq.updated_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              {returnReq.razorpay_refund_id && (
                <p>
                  <span className="font-medium text-gray-900">Razorpay Refund ID:</span>{" "}
                  {returnReq.razorpay_refund_id}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
