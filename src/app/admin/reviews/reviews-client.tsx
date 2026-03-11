"use client";

import { useState } from "react";
import { Trash2, Loader2, CheckCircle, XCircle, Star } from "lucide-react";

interface Review {
  id: string;
  user_id: string | null;
  product_id: string;
  order_id: string | null;
  rating: number;
  title: string | null;
  comment: string | null;
  is_verified_purchase: boolean;
  is_approved: boolean;
  created_at: string;
  product: { name: string } | null;
}

type FilterTab = "all" | "pending" | "approved" | "rejected";

interface Props {
  initialReviews: Review[];
}

export default function ReviewsClient({ initialReviews }: Props) {
  const [reviews, setReviews] = useState(initialReviews);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const getStatus = (r: Review): "pending" | "approved" | "rejected" => {
    // Reviews start as is_approved = false. We treat unmodified ones as "pending".
    // Since there's no explicit "rejected" field, we'll consider:
    // - is_approved = true → approved
    // - is_approved = false → could be pending or rejected
    // For simplicity, newly created reviews are pending, and we track rejections client-side
    return r.is_approved ? "approved" : "pending";
  };

  const filtered = reviews.filter((r) => {
    if (activeTab === "all") return true;
    return getStatus(r) === activeTab;
  });

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "all", label: "All", count: reviews.length },
    { key: "pending", label: "Pending", count: reviews.filter((r) => !r.is_approved).length },
    { key: "approved", label: "Approved", count: reviews.filter((r) => r.is_approved).length },
  ];

  const handleApprove = async (id: string) => {
    setLoadingId(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_approved: true }),
      });
      if (!res.ok) throw new Error("Failed to approve");
      setReviews(reviews.map((r) => (r.id === id ? { ...r, is_approved: true } : r)));
    } catch {
      setError("Failed to approve review");
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setLoadingId(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_approved: false }),
      });
      if (!res.ok) throw new Error("Failed to reject");
      setReviews(reviews.map((r) => (r.id === id ? { ...r, is_approved: false } : r)));
    } catch {
      setError("Failed to reject review");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this review permanently?")) return;
    setLoadingId(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setReviews(reviews.filter((r) => r.id !== id));
    } catch {
      setError("Failed to delete review");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground">Review Moderation</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {reviews.length} review{reviews.length !== 1 ? "s" : ""} — approve or reject customer reviews.
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

      {/* Reviews List */}
      <div className="mt-5 space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-lg bg-card py-16 text-center shadow-sm">
            <p className="text-sm text-muted-foreground">
              {activeTab === "all"
                ? "No reviews yet."
                : `No ${activeTab} reviews.`}
            </p>
          </div>
        ) : (
          filtered.map((review) => {
            const status = getStatus(review);
            const isLoading = loadingId === review.id;

            return (
              <div
                key={review.id}
                className="rounded-lg bg-card p-4 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    {/* Product + Rating */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {review.product?.name || "Unknown Product"}
                      </span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`size-3.5 ${
                              star <= review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                      {review.is_verified_purchase && (
                        <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-600">
                          Verified
                        </span>
                      )}
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          status === "approved"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {status === "approved" ? "Approved" : "Pending"}
                      </span>
                    </div>

                    {/* Title + Comment */}
                    {review.title && (
                      <p className="mt-1.5 text-sm font-medium text-foreground">
                        {review.title}
                      </p>
                    )}
                    {review.comment && (
                      <p className="mt-1 text-sm text-muted-foreground">{review.comment}</p>
                    )}

                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString("en-IN", {
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
                        {!review.is_approved && (
                          <button
                            onClick={() => handleApprove(review.id)}
                            className="flex items-center gap-1 rounded-md border border-green-300 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-50"
                            title="Approve"
                          >
                            <CheckCircle className="size-3.5" /> Approve
                          </button>
                        )}
                        {review.is_approved && (
                          <button
                            onClick={() => handleReject(review.id)}
                            className="flex items-center gap-1 rounded-md border border-yellow-300 px-3 py-1 text-xs font-medium text-yellow-700 hover:bg-yellow-50"
                            title="Unapprove"
                          >
                            <XCircle className="size-3.5" /> Unapprove
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(review.id)}
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
