export default function AdminReturnsPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Return Requests</h2>
      <p className="mt-2 text-sm text-gray-500">
        View and process customer return requests. Approve or deny returns and
        initiate refunds for eligible orders.
      </p>

      {/* Placeholder Returns List */}
      <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[
                "Return ID",
                "Order",
                "Customer",
                "Reason",
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
              { reason: "Defective", status: "Pending" },
              { reason: "Wrong item", status: "Approved" },
              { reason: "Changed mind", status: "Rejected" },
            ].map((ret, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  RET-{String(i + 1).padStart(4, "0")}
                </td>
                <td className="px-6 py-4 text-sm text-indigo-600">
                  #{String(i + 1001).padStart(5, "0")}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Customer {i + 1}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {ret.reason}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      ret.status === "Approved"
                        ? "bg-green-100 text-green-800"
                        : ret.status === "Rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {ret.status}
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
