// OrderStatusBadge: Will display a colored badge indicating the current order status
// (pending, confirmed, shipped, delivered, cancelled, returned).

import React from "react";

interface OrderStatusBadgeProps {
  status: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  returned: "bg-muted text-muted-foreground",
};

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const colorClass = statusColors[status.toLowerCase()] ?? "bg-muted text-muted-foreground";

  return (
    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${colorClass}`}>
      {status}
    </span>
  );
}
