export default async function AdminReturnDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">
        Return Request #{id}
      </h2>
      <p className="mt-2 text-sm text-gray-500">
        Review the return request details and take action. Approve or reject the
        return and process the refund if applicable.
      </p>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Return Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-700 mb-4">
              Returned Items
            </h3>
            <div className="flex items-center gap-4 border border-gray-100 rounded p-3">
              <div className="h-16 w-16 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">
                IMG
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Product Item
                </p>
                <p className="text-xs text-gray-500">Qty: 1</p>
              </div>
              <p className="text-sm text-gray-900">$29.99</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Customer Reason
            </h3>
            <p className="text-sm text-gray-600">
              The item arrived with a defect on the surface. Requesting a full
              refund or replacement.
            </p>
          </div>
        </div>

        {/* Action Panel */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4 h-fit">
          <h3 className="text-sm font-medium text-gray-700">Take Action</h3>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Admin Notes
            </label>
            <div className="h-20 w-full rounded-md border border-gray-300 bg-gray-50" />
          </div>
          <div className="flex gap-3">
            <button className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-500">
              Approve
            </button>
            <button className="flex-1 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-500">
              Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
