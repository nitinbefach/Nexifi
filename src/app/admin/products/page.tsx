import Link from "next/link";

export default function AdminProductsPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Products</h2>
          <p className="mt-2 text-sm text-gray-500">
            Manage your product catalog. Add, edit, or remove products from your
            NEXIFI store.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/products/bulk-upload"
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50"
          >
            Bulk Upload
          </Link>
          <Link
            href="/admin/products/new"
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-500"
          >
            Add Product
          </Link>
        </div>
      </div>

      {/* Placeholder Data Table */}
      <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {["Product", "SKU", "Price", "Stock", "Status", "Actions"].map(
                (header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {[1, 2, 3].map((row) => (
              <tr key={row} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm text-gray-900">
                  Sample Product {row}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  SKU-{String(row).padStart(4, "0")}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  ${(row * 29.99).toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {row * 15}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-indigo-600">Edit</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
