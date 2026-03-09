export default function ReviewsPage() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900">My Reviews</h2>
      <p className="mt-2 text-sm text-gray-500">
        See all the reviews you have written for products purchased on NEXIFI.
      </p>

      {/* Placeholder Review List */}
      <div className="mt-6 space-y-4">
        {[1, 2, 3].map((review) => (
          <div
            key={review}
            className="border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-gray-900">
                Product {review}
              </p>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-sm ${
                      star <= 4 ? "text-yellow-400" : "text-gray-300"
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              This is a placeholder review comment for product {review}. The
              actual review content will appear here.
            </p>
            <p className="mt-2 text-xs text-gray-400">
              Reviewed on Feb {review * 3}, 2026
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
