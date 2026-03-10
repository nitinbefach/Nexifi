import { getDashboardStats } from "@/lib/supabase/admin-queries";
import { formatINR } from "@/lib/utils";
import StatsCard from "@/components/admin/StatsCard";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import { DollarSign, ShoppingCart, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
      <p className="mt-2 text-sm text-gray-500">
        Overview of your store performance and recent activity.
      </p>

      {/* Stats Cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={formatINR(Number(stats.totalRevenue))}
          icon={<DollarSign className="size-5" />}
        />
        <StatsCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={<ShoppingCart className="size-5" />}
        />
        <StatsCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon={<Clock className="size-5" />}
        />
        <StatsCard
          title="Low Stock Products"
          value={stats.lowStockProducts}
          icon={<AlertTriangle className="size-5" />}
        />
      </div>

      {/* Recent Orders */}
      <div className="mt-8 rounded-lg bg-white shadow">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-sm font-semibold text-gray-900">Recent Orders</h3>
          <Link
            href="/admin/orders"
            className="text-xs font-medium text-nexifi-orange hover:underline"
          >
            View All
          </Link>
        </div>

        {stats.recentOrders.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-400">
            No orders yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs font-medium text-gray-500">
                  <th className="px-6 py-3">Order #</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {stats.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-3 font-medium">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {order.guest_name}
                    </td>
                    <td className="px-6 py-3">
                      {formatINR(order.total_amount)}
                    </td>
                    <td className="px-6 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
