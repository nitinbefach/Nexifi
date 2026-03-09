export default function AdminOrdersPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
      <p className="mt-2 text-sm text-gray-500">
        View and manage all customer orders. Filter by status, date, or
        customer to find specific orders quickly.
      </p>

      {/* Placeholder Data Table */}
      <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[
                "Order ID",
                "Customer",
                "Date",
                "Total",
                "Status",
                "Actions",
              ].map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {[
              { status: "Processing", color: "yellow" },
              { status: "Shipped", color: "blue" },
              { status: "Delivered", color: "green" },
            ].map((order, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  #{String(i + 1001).padStart(5, "0")}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Customer {i + 1}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Mar {i + 1}, 2026
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  ${((i + 1) * 59.99).toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full bg-${order.color}-100 text-${order.color}-800`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-indigo-600">View</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
