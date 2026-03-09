export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900">
        Order #{id}
      </h2>
      <p className="mt-2 text-sm text-gray-500">
        View the full details of your order including item breakdown, shipping
        status, and delivery timeline.
      </p>

      {/* Status Tracker Placeholder */}
      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Order Status
        </h3>
        <div className="flex items-center gap-2">
          {["Confirmed", "Shipped", "Out for Delivery", "Delivered"].map(
            (step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    i <= 1
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {i + 1}
                </div>
                <span className="text-xs text-gray-600 hidden sm:inline">
                  {step}
                </span>
                {i < 3 && (
                  <div
                    className={`h-0.5 w-6 ${
                      i < 1 ? "bg-indigo-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            )
          )}
        </div>
      </div>

      {/* Items List Placeholder */}
      <div className="mt-8">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Items</h3>
        <div className="space-y-3">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="flex items-center gap-4 border border-gray-200 rounded-lg p-3"
            >
              <div className="h-16 w-16 bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-400">
                IMG
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Product Item {item}
                </p>
                <p className="text-xs text-gray-500">Qty: {item}</p>
              </div>
              <p className="text-sm font-medium text-gray-900">
                ${(item * 29.99).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
