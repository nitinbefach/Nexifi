import {
  getDashboardStats,
  getDailyRevenue,
  getOrderStatusCounts,
} from "@/lib/supabase/admin-queries";
import { formatINR } from "@/lib/utils";
import StatsCard from "@/components/admin/StatsCard";
import DashboardCharts from "@/components/admin/DashboardCharts";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import AnimatedPage from "@/components/admin/AnimatedPage";
import {
  IndianRupee,
  ShoppingCart,
  Clock,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import LinkButton from "@/components/admin/LinkButton";

export default async function AdminDashboardPage() {
  const [stats, revenueData, statusData] = await Promise.all([
    getDashboardStats(),
    getDailyRevenue(7),
    getOrderStatusCounts(),
  ]);

  return (
    <AnimatedPage className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your store performance and recent activity.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={formatINR(Number(stats.totalRevenue))}
          icon={<IndianRupee className="size-5" />}
          colorVariant="emerald"
          index={0}
        />
        <StatsCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={<ShoppingCart className="size-5" />}
          colorVariant="blue"
          index={1}
        />
        <StatsCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon={<Clock className="size-5" />}
          colorVariant="orange"
          index={2}
        />
        <StatsCard
          title="Low Stock Products"
          value={stats.lowStockProducts}
          icon={<AlertTriangle className="size-5" />}
          colorVariant="red"
          index={3}
        />
      </div>

      {/* Charts */}
      <DashboardCharts revenueData={revenueData} statusData={statusData} />

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Recent Orders</CardTitle>
            <CardDescription>Latest orders from your store</CardDescription>
          </div>
          <LinkButton href="/admin/orders" className="gap-1.5">
            View All
            <ArrowRight className="size-3.5" />
          </LinkButton>
        </CardHeader>
        <CardContent>
          {stats.recentOrders.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No orders yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentOrders.map((order) => (
                  <TableRow key={order.id} className="admin-table-row">
                    <TableCell className="font-medium">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="hover:text-nexifi-orange hover:underline"
                      >
                        {order.order_number}
                      </Link>
                    </TableCell>
                    <TableCell>{order.guest_name}</TableCell>
                    <TableCell>{formatINR(order.total_amount)}</TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AnimatedPage>
  );
}
