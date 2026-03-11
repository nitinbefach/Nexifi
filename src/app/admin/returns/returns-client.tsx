"use client";

import { useState } from "react";
import Link from "next/link";
import { Trash2, Loader2, CheckCircle, XCircle, Eye } from "lucide-react";
import { RETURN_REASONS } from "@/lib/constants";

type ReturnStatus = "requested" | "approved" | "rejected" | "pickup_scheduled" | "received" | "refunded";

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
  } | null;
}

type FilterTab = "all" | "requested" | "approved" | "rejected";

interface Props {
  initialReturns: ReturnRequest[];
}

const STATUS_STYLES: Record<ReturnStatus, string> = {
  requested: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  pickup_scheduled: "bg-blue-100 text-blue-800",
  received: "bg-purple-100 text-purple-800",
  refunded: "bg-muted text-foreground",
};

const STATUS_LABELS: Record<ReturnStatus, string> = {
  requested: "Requested",
  approved: "Approved",
  rejected: "Rejected",
  pickup_scheduled: "Pickup Scheduled",
  received: "Received",
  refunded: "Refunded",
};

function getReasonLabel(reason: string): string {
  const found = RETURN_REASONS.find((r) => r.value === reason);
  return found ? found.label : reason;
}

export default function ReturnsClient({ initialReturns }: Props) {
  const [returns, setReturns] = useState(initialReturns);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const filtered = returns.filter((r) => {
    if (activeTab === "all") return true;
    return r.status === activeTab;
  });

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "all", label: "All", count: returns.length },
    { key: "requested", label: "Requested", count: returns.filter((r) => r.status === "requested").length },
    { key: "approved", label: "Approved", count: returns.filter((r) => r.status === "approved").length },
    { key: "rejected", label: "Rejected", count: returns.filter((r) => r.status === "rejected").length },
  ];

  const handleApprove = async (id: string) => {
    setLoadingId(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/returns/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });
      if (!res.ok) throw new Error("Failed to approve");
      setReturns(returns.map((r) => (r.id === id ? { ...r, status: "approved" as ReturnStatus } : r)));
    } catch {
      setError("Failed to approve return request");
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setLoadingId(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/returns/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected" }),
      });
      if (!res.ok) throw new Error("Failed to reject");
      setReturns(returns.map((r) => (r.id === id ? { ...r, status: "rejected" as ReturnStatus } : r)));
    } catch {
      setError("Failed to reject return request");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this return request permanently?")) return;
    setLoadingId(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/returns/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setReturns(returns.filter((r) => r.id !== id));
    } catch {
      setError("Failed to delete return request");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground">Return Requests</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {returns.length} return request{returns.length !== 1 ? "s" : ""} — review and process customer returns.
      </p>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      )}

      {/* Filter Tabs */}
      <div className="mt-5 flex gap-1 rounded-lg bg-muted p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            <span className="ml-1.5 text-xs text-muted-foreground">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Returns List */}
      <div className="mt-5 space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-lg bg-card py-16 text-center shadow-sm">
            <p className="text-sm text-muted-foreground">
              {activeTab === "all"
                ? "No return requests yet."
                : `No ${activeTab} return requests.`}
            </p>
          </div>
        ) : (
          filtered.map((ret) => {
            const isLoading = loadingId === ret.id;

            return (
              <div
                key={ret.id}
                className="rounded-lg bg-card p-4 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    {/* Order Number + Status */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        Order {ret.order?.order_number || "N/A"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {ret.order?.guest_name || "Unknown"}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          STATUS_STYLES[ret.status]
                        }`}
                      >
                        {STATUS_LABELS[ret.status]}
                      </span>
                    </div>

                    {/* Reason */}
                    <p className="mt-1.5 text-sm font-medium text-foreground">
                      {getReasonLabel(ret.reason)}
                    </p>

                    {/* Description (truncated) */}
                    {ret.description && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {ret.description.length > 120
                          ? `${ret.description.slice(0, 120)}...`
                          : ret.description}
                      </p>
                    )}

                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {new Date(ret.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {isLoading ? (
                      <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <Link
                          href={`/admin/returns/${ret.id}`}
                          className="flex items-center gap-1 rounded-md border border-border px-3 py-1 text-xs font-medium text-foreground hover:bg-muted"
                          title="View Details"
                        >
                          <Eye className="size-3.5" /> View
                        </Link>
                        {ret.status === "requested" && (
                          <>
                            <button
                              onClick={() => handleApprove(ret.id)}
                              className="flex items-center gap-1 rounded-md border border-green-300 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-50"
                              title="Approve"
                            >
                              <CheckCircle className="size-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => handleReject(ret.id)}
                              className="flex items-center gap-1 rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                              title="Reject"
                            >
                              <XCircle className="size-3.5" /> Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(ret.id)}
                          className="rounded p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
