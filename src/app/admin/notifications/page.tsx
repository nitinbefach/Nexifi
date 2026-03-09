export default function AdminNotificationsPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Notification Log</h2>
      <p className="mt-2 text-sm text-gray-500">
        View all system notifications and alerts sent to customers and
        administrators for the NEXIFI store.
      </p>

      {/* Placeholder Notification List */}
      <div className="mt-6 space-y-3">
        {[
          {
            type: "Order",
            message: "Order #01001 has been placed by Alice Johnson",
            time: "2 minutes ago",
          },
          {
            type: "Stock",
            message: "Wireless Headphones stock is below threshold (3 left)",
            time: "15 minutes ago",
          },
          {
            type: "Return",
            message: "New return request RET-0001 submitted",
            time: "1 hour ago",
          },
          {
            type: "Review",
            message: "New 1-star review requires moderation",
            time: "3 hours ago",
          },
          {
            type: "System",
            message: "Daily backup completed successfully",
            time: "6 hours ago",
          },
        ].map((notification, i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow px-4 py-3 flex items-center justify-between hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <span
                className={`px-2 py-0.5 text-xs font-medium rounded ${
                  notification.type === "Order"
                    ? "bg-blue-100 text-blue-700"
                    : notification.type === "Stock"
                      ? "bg-orange-100 text-orange-700"
                      : notification.type === "Return"
                        ? "bg-yellow-100 text-yellow-700"
                        : notification.type === "Review"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-700"
                }`}
              >
                {notification.type}
              </span>
              <p className="text-sm text-gray-700">{notification.message}</p>
            </div>
            <p className="text-xs text-gray-400 whitespace-nowrap ml-4">
              {notification.time}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
