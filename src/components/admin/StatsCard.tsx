// StatsCard: Will display a dashboard statistics card with title, value, icon,
// and optional trend indicator (up/down percentage).

import React from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function StatsCard({ title, value, icon, trend }: StatsCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{title}</p>
        <div className="text-muted-foreground">{icon}</div>
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      {trend && (
        <p className={`mt-1 text-xs ${trend.isPositive ? "text-green-600" : "text-red-600"}`}>
          {trend.isPositive ? "+" : ""}{trend.value}%
        </p>
      )}
    </div>
  );
}
