export default function AdminInvoicesPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Invoices</h2>
      <p className="mt-2 text-sm text-gray-500">
        View and manage invoices generated for NEXIFI orders. Download or resend
        invoices to customers as needed.
      </p>

      {/* Placeholder Invoice List */}
      <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[
                "Invoice #",
                "Order",
                "Customer",
                "Amount",
                "Date",
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
            {[1, 2, 3].map((inv) => (
              <tr key={inv} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  INV-{String(inv).padStart(5, "0")}
                </td>
                <td className="px-6 py-4 text-sm text-indigo-600">
                  #{String(inv + 1000).padStart(5, "0")}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Customer {inv}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  ${(inv * 95.96).toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Mar {inv}, 2026
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-3">
                    <button className="text-sm text-indigo-600 hover:text-indigo-500">
                      Download
                    </button>
                    <button className="text-sm text-gray-600 hover:text-gray-500">
                      Resend
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
