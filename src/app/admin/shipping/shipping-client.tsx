"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X, Loader2, ExternalLink, Truck } from "lucide-react";

interface Shipment {
  id: string;
  order_id: string;
  awb_number: string;
  courier_name: string;
  tracking_url: string | null;
  status: string;
  estimated_delivery: string | null;
  weight_kg: number | null;
  created_at: string;
  order: { order_number: string; guest_name: string; status: string } | null;
}

interface Props {
  initialShipments: Shipment[];
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  in_transit: "bg-blue-100 text-blue-800",
  delivered: "bg-green-100 text-green-800",
  returned: "bg-red-100 text-red-800",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  in_transit: "In Transit",
  delivered: "Delivered",
  returned: "Returned",
};

export default function ShippingClient({ initialShipments }: Props) {
  const router = useRouter();
  const [shipments, setShipments] = useState(initialShipments);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [formOrderId, setFormOrderId] = useState("");
  const [formAwb, setFormAwb] = useState("");
  const [formCourier, setFormCourier] = useState("");
  const [formTrackingUrl, setFormTrackingUrl] = useState("");
  const [formEstimatedDelivery, setFormEstimatedDelivery] = useState("");
  const [formWeightKg, setFormWeightKg] = useState("");
  const [formStatus, setFormStatus] = useState("pending");

  const resetForm = () => {
    setFormOrderId("");
    setFormAwb("");
    setFormCourier("");
    setFormTrackingUrl("");
    setFormEstimatedDelivery("");
    setFormWeightKg("");
    setFormStatus("pending");
    setEditingId(null);
    setShowAdd(false);
    setError("");
  };

  const startEdit = (s: Shipment) => {
    setEditingId(s.id);
    setShowAdd(false);
    setFormOrderId(s.order_id);
    setFormAwb(s.awb_number);
    setFormCourier(s.courier_name);
    setFormTrackingUrl(s.tracking_url || "");
    setFormEstimatedDelivery(s.estimated_delivery ? s.estimated_delivery.slice(0, 10) : "");
    setFormWeightKg(s.weight_kg ? String(s.weight_kg) : "");
    setFormStatus(s.status);
    setError("");
  };

  const startAdd = () => {
    resetForm();
    setShowAdd(true);
  };

  const handleSave = async () => {
    if (!editingId && !formOrderId.trim()) {
      setError("Order ID is required");
      return;
    }
    if (!formAwb.trim() || !formCourier.trim()) {
      setError("AWB number and courier name are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const isEdit = !!editingId;
      const url = isEdit
        ? `/api/admin/shipments/${editingId}`
        : "/api/admin/shipments";
      const method = isEdit ? "PUT" : "POST";

      const payload: Record<string, unknown> = {
        awb_number: formAwb.trim(),
        courier_name: formCourier.trim(),
        tracking_url: formTrackingUrl.trim() || null,
        estimated_delivery: formEstimatedDelivery || null,
        weight_kg: formWeightKg ? Number(formWeightKg) : null,
        status: formStatus,
      };

      if (!isEdit) {
        payload.order_id = formOrderId.trim();
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      resetForm();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this shipment record?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/shipments/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setShipments(shipments.filter((s) => s.id !== id));
    } catch {
      setError("Failed to delete shipment");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const showForm = showAdd || editingId;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Shipments</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {shipments.length} shipment{shipments.length !== 1 ? "s" : ""} — track and manage order deliveries.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={startAdd}
            className="flex items-center gap-2 rounded-lg bg-nexifi-orange px-4 py-2 text-sm font-medium text-white hover:bg-nexifi-orange-dark"
          >
            <Plus className="size-4" /> Add Shipment
          </button>
        )}
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      )}

      {/* Inline Form */}
      {showForm && (
        <div className="mt-4 rounded-lg bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">
              {editingId ? "Edit Shipment" : "New Shipment"}
            </h3>
            <button onClick={resetForm} className="text-muted-foreground hover:text-muted-foreground">
              <X className="size-5" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {!editingId && (
              <div>
                <label className="block text-sm font-medium text-foreground">
                  Order ID <span className="text-red-500">*</span>
                </label>
                <input
                  value={formOrderId}
                  onChange={(e) => setFormOrderId(e.target.value)}
                  placeholder="Paste order UUID"
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm font-mono focus:border-nexifi-orange focus:outline-none focus:ring-1 focus:ring-nexifi-orange"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-foreground">
                AWB Number <span className="text-red-500">*</span>
              </label>
              <input
                value={formAwb}
                onChange={(e) => setFormAwb(e.target.value)}
                placeholder="e.g. 1234567890"
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm font-mono focus:border-nexifi-orange focus:outline-none focus:ring-1 focus:ring-nexifi-orange"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground">
                Courier Name <span className="text-red-500">*</span>
              </label>
              <input
                value={formCourier}
                onChange={(e) => setFormCourier(e.target.value)}
                placeholder="e.g. Delhivery, BlueDart"
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-nexifi-orange focus:outline-none focus:ring-1 focus:ring-nexifi-orange"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground">Tracking URL</label>
              <input
                value={formTrackingUrl}
                onChange={(e) => setFormTrackingUrl(e.target.value)}
                placeholder="https://track.delhivery.com/..."
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-nexifi-orange focus:outline-none focus:ring-1 focus:ring-nexifi-orange"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground">Estimated Delivery</label>
              <input
                type="date"
                value={formEstimatedDelivery}
                onChange={(e) => setFormEstimatedDelivery(e.target.value)}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-nexifi-orange focus:outline-none focus:ring-1 focus:ring-nexifi-orange"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={formWeightKg}
                onChange={(e) => setFormWeightKg(e.target.value)}
                placeholder="0.5"
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-nexifi-orange focus:outline-none focus:ring-1 focus:ring-nexifi-orange"
              />
            </div>

            {editingId && (
              <div>
                <label className="block text-sm font-medium text-foreground">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-nexifi-orange focus:outline-none focus:ring-1 focus:ring-nexifi-orange"
                >
                  <option value="pending">Pending</option>
                  <option value="in_transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                  <option value="returned">Returned</option>
                </select>
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={resetForm}
              className="rounded-md border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
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
      )}

      {/* Shipments Table */}
      <div className="mt-6 overflow-hidden rounded-lg bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted text-left text-xs font-medium uppercase text-muted-foreground">
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">AWB Number</th>
                <th className="px-5 py-3">Courier</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Tracking</th>
                <th className="px-5 py-3">Est. Delivery</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {shipments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center">
                    <Truck className="mx-auto size-10 text-muted-foreground" />
                    <p className="mt-3 text-sm text-muted-foreground">
                      No shipments yet. Add one to start tracking deliveries.
                    </p>
                  </td>
                </tr>
              ) : (
                shipments.map((s) => (
                  <tr key={s.id} className="hover:bg-muted">
                    <td className="px-5 py-3">
                      <span className="font-mono text-nexifi-orange">
                        {s.order?.order_number || "—"}
                      </span>
                      {s.order?.guest_name && (
                        <p className="mt-0.5 text-xs text-muted-foreground">{s.order.guest_name}</p>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-mono font-medium text-foreground">{s.awb_number}</span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{s.courier_name}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          STATUS_STYLES[s.status] || "bg-muted text-muted-foreground"
                        }`}
                      >
                        {STATUS_LABELS[s.status] || s.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {s.tracking_url ? (
                        <a
                          href={s.tracking_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-nexifi-orange hover:underline"
                        >
                          Track <ExternalLink className="size-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {formatDate(s.estimated_delivery)}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {formatDate(s.created_at)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => startEdit(s)}
                          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-muted-foreground"
                          title="Edit"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="rounded p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600"
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
