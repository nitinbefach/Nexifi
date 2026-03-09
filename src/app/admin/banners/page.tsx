export default function AdminBannersPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Banners</h2>
          <p className="mt-2 text-sm text-gray-500">
            Manage promotional banners displayed on the NEXIFI storefront.
            Upload images, set links, and control display order.
          </p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-500">
          Add Banner
        </button>
      </div>

      {/* Placeholder Banner List */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {["Hero Banner", "Sale Banner", "New Arrivals", "Seasonal"].map(
          (banner, i) => (
            <div
              key={banner}
              className="bg-white rounded-lg shadow overflow-hidden"
            >
              <div className="h-36 bg-gray-200 flex items-center justify-center text-sm text-gray-400">
                Banner Image Placeholder
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{banner}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Position: {i + 1}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button className="text-sm text-indigo-600 hover:text-indigo-500">
                    Edit
                  </button>
                  <button className="text-sm text-red-600 hover:text-red-500">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
