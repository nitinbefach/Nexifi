"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X, Loader2 } from "lucide-react";
import { formatINR } from "@/lib/utils";

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  min_order_amount: number;
  max_discount_amount: number | null;
  usage_limit: number | null;
  used_count: number;
  is_active: boolean;
  valid_from: string | null;
  valid_until: string | null;
}

interface Props {
  initialCoupons: Coupon[];
}

export default function CouponsClient({ initialCoupons }: Props) {
  const router = useRouter();
  const [coupons, setCoupons] = useState(initialCoupons);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [formCode, setFormCode] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDiscountType, setFormDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [formDiscountValue, setFormDiscountValue] = useState("");
  const [formMinOrder, setFormMinOrder] = useState("");
  const [formMaxDiscount, setFormMaxDiscount] = useState("");
  const [formUsageLimit, setFormUsageLimit] = useState("");
  const [formValidFrom, setFormValidFrom] = useState("");
  const [formValidUntil, setFormValidUntil] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);

  const resetForm = () => {
    setFormCode("");
    setFormDescription("");
    setFormDiscountType("percentage");
    setFormDiscountValue("");
    setFormMinOrder("");
    setFormMaxDiscount("");
    setFormUsageLimit("");
    setFormValidFrom("");
    setFormValidUntil("");
    setFormIsActive(true);
    setEditingId(null);
    setShowAdd(false);
    setError("");
  };

  const startEdit = (c: Coupon) => {
    setEditingId(c.id);
    setShowAdd(false);
    setFormCode(c.code);
    setFormDescription(c.description || "");
    setFormDiscountType(c.discount_type);
    setFormDiscountValue(String(c.discount_value));
    setFormMinOrder(c.min_order_amount ? String(c.min_order_amount) : "");
    setFormMaxDiscount(c.max_discount_amount ? String(c.max_discount_amount) : "");
    setFormUsageLimit(c.usage_limit ? String(c.usage_limit) : "");
    setFormValidFrom(c.valid_from ? c.valid_from.slice(0, 16) : "");
    setFormValidUntil(c.valid_until ? c.valid_until.slice(0, 16) : "");
    setFormIsActive(c.is_active);
    setError("");
  };

  const startAdd = () => {
    resetForm();
    setShowAdd(true);
  };

  const getPayload = () => ({
    code: formCode.trim(),
    description: formDescription.trim() || null,
    discount_type: formDiscountType,
    discount_value: Number(formDiscountValue),
    min_order_amount: formMinOrder ? Number(formMinOrder) : 0,
    max_discount_amount: formMaxDiscount ? Number(formMaxDiscount) : null,
    usage_limit: formUsageLimit ? Number(formUsageLimit) : null,
    valid_from: formValidFrom || null,
    valid_until: formValidUntil || null,
    is_active: formIsActive,
  });

  const handleSave = async () => {
    if (!formCode.trim() || !formDiscountValue) {
      setError("Code and discount value are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const isEdit = !!editingId;
      const url = isEdit ? `/api/admin/coupons/${editingId}` : "/api/admin/coupons";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(getPayload()),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      resetForm();
      router.refresh();
      // Optimistic: re-fetch
      const refreshRes = await fetch("/api/admin/coupons");
      if (refreshRes.ok) {
        // We don't have a GET route, so just refresh the page
      }
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setCoupons(coupons.filter((c) => c.id !== id));
    } catch {
      setError("Failed to delete coupon");
    } finally {
      setLoading(false);
    }
  };

  const formatDiscount = (c: Coupon) =>
    c.discount_type === "percentage" ? `${c.discount_value}%` : formatINR(c.discount_value);

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const isExpired = (c: Coupon) => {
    if (!c.valid_until) return false;
    return new Date(c.valid_until) < new Date();
  };

  const showForm = showAdd || editingId;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Coupons</h2>
          <p className="mt-1 text-sm text-gray-500">
            {coupons.length} coupon{coupons.length !== 1 ? "s" : ""}
          </p>
        </div>
        {!showForm && (
          <button
            onClick={startAdd}
            className="flex items-center gap-2 rounded-lg bg-nexifi-orange px-4 py-2 text-sm font-medium text-white hover:bg-nexifi-orange-dark"
          >
            <Plus className="size-4" /> Create Coupon
          </button>
        )}
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      )}

      {/* Inline Form */}
      {showForm && (
        <div className="mt-4 rounded-lg bg-white p-5 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              {editingId ? "Edit Coupon" : "New Coupon"}
            </h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X className="size-5" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Code</label>
              <input
                value={formCode}
                onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                placeholder="WELCOME10"
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm font-mono uppercase focus:border-nexifi-orange focus:outline-none focus:ring-1 focus:ring-nexifi-orange"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Discount Type</label>
              <select
                value={formDiscountType}
                onChange={(e) => setFormDiscountType(e.target.value as "percentage" | "fixed")}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-nexifi-orange focus:outline-none focus:ring-1 focus:ring-nexifi-orange"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Discount Value {formDiscountType === "percentage" ? "(%)" : "(₹)"}
              </label>
              <input
                type="number"
                value={formDiscountValue}
                onChange={(e) => setFormDiscountValue(e.target.value)}
                placeholder={formDiscountType === "percentage" ? "10" : "100"}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-nexifi-orange focus:outline-none focus:ring-1 focus:ring-nexifi-orange"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Min Order Amount (₹)</label>
              <input
                type="number"
                value={formMinOrder}
                onChange={(e) => setFormMinOrder(e.target.value)}
                placeholder="0"
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-nexifi-orange focus:outline-none focus:ring-1 focus:ring-nexifi-orange"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Max Discount (₹)</label>
              <input
                type="number"
                value={formMaxDiscount}
                onChange={(e) => setFormMaxDiscount(e.target.value)}
                placeholder="No limit"
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-nexifi-orange focus:outline-none focus:ring-1 focus:ring-nexifi-orange"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Usage Limit</label>
              <input
                type="number"
                value={formUsageLimit}
                onChange={(e) => setFormUsageLimit(e.target.value)}
                placeholder="Unlimited"
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-nexifi-orange focus:outline-none focus:ring-1 focus:ring-nexifi-orange"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Valid From</label>
              <input
                type="datetime-local"
                value={formValidFrom}
                onChange={(e) => setFormValidFrom(e.target.value)}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-nexifi-orange focus:outline-none focus:ring-1 focus:ring-nexifi-orange"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Valid Until</label>
              <input
                type="datetime-local"
                value={formValidUntil}
                onChange={(e) => setFormValidUntil(e.target.value)}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-nexifi-orange focus:outline-none focus:ring-1 focus:ring-nexifi-orange"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <input
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Optional description"
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-nexifi-orange focus:outline-none focus:ring-1 focus:ring-nexifi-orange"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={formIsActive}
                onChange={(e) => setFormIsActive(e.target.checked)}
                className="rounded border-gray-300 text-nexifi-orange focus:ring-nexifi-orange"
              />
              Active
            </label>

            <div className="flex gap-2">
              <button
                onClick={resetForm}
                className="rounded-md border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 rounded-md bg-nexifi-orange px-4 py-2 text-sm font-medium text-white hover:bg-nexifi-orange-dark disabled:opacity-50"
              >
                {loading && <Loader2 className="size-4 animate-spin" />}
                {editingId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coupon Table */}
      <div className="mt-6 overflow-hidden rounded-lg bg-white shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-xs font-medium uppercase text-gray-500">
                <th className="px-5 py-3">Code</th>
                <th className="px-5 py-3">Discount</th>
                <th className="px-5 py-3">Min Order</th>
                <th className="px-5 py-3">Usage</th>
                <th className="px-5 py-3">Validity</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-gray-400">
                    No coupons yet. Create one to get started.
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <button
                        onClick={() => startEdit(c)}
                        className="font-mono font-medium text-nexifi-orange hover:underline"
                      >
                        {c.code}
                      </button>
                      {c.description && (
                        <p className="mt-0.5 text-xs text-gray-400">{c.description}</p>
                      )}
                    </td>
                    <td className="px-5 py-3 font-medium">
                      {formatDiscount(c)}
                      {c.max_discount_amount && c.discount_type === "percentage" && (
                        <span className="ml-1 text-xs text-gray-400">
                          (max {formatINR(c.max_discount_amount)})
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {c.min_order_amount > 0 ? formatINR(c.min_order_amount) : "—"}
                    </td>
                    <td className="px-5 py-3 text-gray-600">
                      {c.used_count}{c.usage_limit ? ` / ${c.usage_limit}` : ""}
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500">
                      {formatDate(c.valid_from)} — {formatDate(c.valid_until)}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          !c.is_active || isExpired(c)
                            ? "bg-gray-100 text-gray-600"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {!c.is_active ? "Inactive" : isExpired(c) ? "Expired" : "Active"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => startEdit(c)}
                          className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          title="Edit"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
