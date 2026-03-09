export default function AdminShippingPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Shipments</h2>
      <p className="mt-2 text-sm text-gray-500">
        Track and manage all shipments for NEXIFI orders. Monitor delivery
        status and update tracking information.
      </p>

      {/* Placeholder Shipments Table */}
      <div className="mt-6 bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {[
                "Shipment ID",
                "Order",
                "Carrier",
                "Tracking",
                "Status",
                "Date",
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
              { carrier: "FedEx", status: "In Transit" },
              { carrier: "UPS", status: "Delivered" },
              { carrier: "USPS", status: "Out for Delivery" },
            ].map((shipment, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  SHP-{String(i + 1).padStart(4, "0")}
                </td>
                <td className="px-6 py-4 text-sm text-indigo-600">
                  #{String(i + 1001).padStart(5, "0")}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {shipment.carrier}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                  1Z{String(i + 1).padStart(10, "0")}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      shipment.status === "Delivered"
                        ? "bg-green-100 text-green-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {shipment.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  Mar {i + 1}, 2026
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
