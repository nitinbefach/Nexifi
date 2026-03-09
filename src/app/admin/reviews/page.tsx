export default function AdminReviewsPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Review Moderation</h2>
      <p className="mt-2 text-sm text-gray-500">
        Review and moderate customer-submitted product reviews. Approve,
        reject, or flag reviews that violate NEXIFI store policies.
      </p>

      {/* Placeholder Review List */}
      <div className="mt-6 space-y-4">
        {[
          { product: "Wireless Headphones", rating: 5, status: "Pending" },
          { product: "USB-C Cable", rating: 2, status: "Pending" },
          { product: "Phone Case", rating: 4, status: "Approved" },
        ].map((review, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900">
                  {review.product}
                </p>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-xs ${
                        star <= review.rating
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                &quot;Placeholder review text from customer...&quot;
              </p>
              <p className="text-xs text-gray-400 mt-1">
                By Customer {i + 1} &middot; Mar {i + 1}, 2026
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                  review.status === "Approved"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {review.status}
              </span>
              {review.status === "Pending" && (
                <>
                  <button className="px-3 py-1 text-xs font-medium text-green-700 border border-green-300 rounded-md hover:bg-green-50">
                    Approve
                  </button>
                  <button className="px-3 py-1 text-xs font-medium text-red-700 border border-red-300 rounded-md hover:bg-red-50">
                    Reject
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
