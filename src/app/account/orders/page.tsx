export default function OrdersPage() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900">My Orders</h2>
      <p className="mt-2 text-sm text-gray-500">
        Track and manage all your past and current orders. Click on any order to
        view its details.
      </p>

      {/* Placeholder Order List */}
      <div className="mt-6 space-y-4">
        {[1, 2, 3].map((order) => (
          <div
            key={order}
            className="border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
          >
            <div>
              <p className="text-sm font-medium text-gray-900">
                Order #{String(order).padStart(5, "0")}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Placed on Jan {order * 5}, 2026
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Delivered
              </span>
              <span className="text-sm font-medium text-gray-900">
                ${(order * 49.99).toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
