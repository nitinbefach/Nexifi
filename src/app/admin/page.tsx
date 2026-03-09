export default function AdminDashboardPage() {
  const stats = [
    { label: "Total Revenue", value: "$12,450.00", change: "+8.2%" },
    { label: "Orders Today", value: "24", change: "+12%" },
    { label: "Pending Orders", value: "7", change: "-3%" },
    { label: "Low Stock", value: "5", change: "" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
      <p className="mt-2 text-sm text-gray-500">
        Overview of your store performance, key metrics, and recent activity on
        NEXIFI.
      </p>

      {/* Stats Cards */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-lg shadow p-5"
          >
            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {stat.value}
            </p>
            {stat.change && (
              <p
                className={`mt-1 text-xs font-medium ${
                  stat.change.startsWith("+")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {stat.change} from yesterday
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Placeholder Chart Area */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h3 className="text-sm font-medium text-gray-700 mb-4">
          Revenue Overview
        </h3>
        <div className="h-64 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-sm text-gray-400">
          Chart Placeholder &mdash; Revenue data visualization will appear here
        </div>
      </div>
    </div>
  );
}
