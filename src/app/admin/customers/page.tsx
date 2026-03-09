export default function AdminCustomersPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Customers</h2>
      <p className="mt-2 text-sm text-gray-500">
        View and manage all registered customers on your NEXIFI store. Access
        customer profiles, order history, and account details.
      </p>

      {/* Placeholder Customer List */}
      <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {["Customer", "Email", "Orders", "Total Spent", "Joined"].map(
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
            {[
              { name: "Alice Johnson", orders: 12, spent: "$1,249.00" },
              { name: "Bob Smith", orders: 5, spent: "$430.00" },
              { name: "Carol Williams", orders: 8, spent: "$890.00" },
            ].map((customer, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {customer.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {customer.name.toLowerCase().replace(" ", ".")}@email.com
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {customer.orders}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {customer.spent}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Jan {i + 10}, 2026
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
