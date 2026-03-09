export default function AddressesPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">My Addresses</h2>
          <p className="mt-2 text-sm text-gray-500">
            Manage your saved shipping and billing addresses for faster
            checkout.
          </p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-500">
          Add New Address
        </button>
      </div>

      {/* Placeholder Address Cards */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          {
            label: "Home",
            address: "123 Main Street, Apt 4B, New York, NY 10001",
            isDefault: true,
          },
          {
            label: "Office",
            address: "456 Business Ave, Suite 200, San Francisco, CA 94102",
            isDefault: false,
          },
        ].map((addr) => (
          <div
            key={addr.label}
            className="border border-gray-200 rounded-lg p-4 relative"
          >
            {addr.isDefault && (
              <span className="absolute top-3 right-3 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-700">
                Default
              </span>
            )}
            <p className="text-sm font-medium text-gray-900">{addr.label}</p>
            <p className="mt-1 text-sm text-gray-600">{addr.address}</p>
            <div className="mt-3 flex gap-3">
              <button className="text-xs text-indigo-600 hover:text-indigo-500">
                Edit
              </button>
              <button className="text-xs text-red-600 hover:text-red-500">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
