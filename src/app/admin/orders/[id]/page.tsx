export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Order #{id}</h2>
      <p className="mt-2 text-sm text-gray-500">
        Review order details and update the fulfillment status. Manage shipping
        and notify the customer of updates.
      </p>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-700 mb-4">
              Order Items
            </h3>
            <div className="space-y-3">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-4 border border-gray-100 rounded p-3"
                >
                  <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">
                    IMG
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      Product {item}
                    </p>
                    <p className="text-xs text-gray-500">Qty: {item}</p>
                  </div>
                  <p className="text-sm text-gray-900">
                    ${(item * 29.99).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Customer Information
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>John Doe</p>
              <p>john@example.com</p>
              <p>123 Main St, New York, NY 10001</p>
            </div>
          </div>
        </div>

        {/* Status Update Controls */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-700 mb-4">
              Update Status
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Order Status
                </label>
                <div className="h-10 w-full rounded-md border border-gray-300 bg-gray-50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Tracking Number
                </label>
                <div className="h-10 w-full rounded-md border border-gray-300 bg-gray-50" />
              </div>
              <button className="w-full px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-500">
                Update Order
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Order Summary
            </h3>
            <div className="text-sm space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>$89.97</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>$5.99</span>
              </div>
              <div className="flex justify-between font-medium text-gray-900 border-t pt-2">
                <span>Total</span>
                <span>$95.96</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
