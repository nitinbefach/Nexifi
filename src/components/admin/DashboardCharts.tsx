"use client";

import RevenueChart from "./RevenueChart";
import OrderStatusChart from "./OrderStatusChart";
import type { DailyRevenuePoint, OrderStatusCount } from "@/lib/supabase/admin-queries";

interface DashboardChartsProps {
  revenueData: DailyRevenuePoint[];
  statusData: OrderStatusCount[];
}

export default function DashboardCharts({
  revenueData,
  statusData,
}: DashboardChartsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <RevenueChart data={revenueData} />
      </div>
      <div>
        <OrderStatusChart data={statusData} />
      </div>
    </div>
  );
}
