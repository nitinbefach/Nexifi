"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  iconClassName?: string;
  colorVariant?: "purple" | "teal" | "orange" | "blue" | "emerald" | "red";
  index?: number;
}

const colorMap = {
  purple: {
    bg: "bg-gradient-to-br from-purple-500 to-purple-700",
    icon: "bg-white/20 text-white",
    text: "text-white",
    muted: "text-white/75",
    trend: { pos: "text-emerald-200", neg: "text-red-200" },
  },
  teal: {
    bg: "bg-gradient-to-br from-teal-500 to-teal-700",
    icon: "bg-white/20 text-white",
    text: "text-white",
    muted: "text-white/75",
    trend: { pos: "text-emerald-200", neg: "text-red-200" },
  },
  orange: {
    bg: "bg-gradient-to-br from-orange-400 to-orange-600",
    icon: "bg-white/20 text-white",
    text: "text-white",
    muted: "text-white/75",
    trend: { pos: "text-emerald-200", neg: "text-red-200" },
  },
  blue: {
    bg: "bg-gradient-to-br from-blue-500 to-blue-700",
    icon: "bg-white/20 text-white",
    text: "text-white",
    muted: "text-white/75",
    trend: { pos: "text-emerald-200", neg: "text-red-200" },
  },
  emerald: {
    bg: "bg-gradient-to-br from-emerald-500 to-emerald-700",
    icon: "bg-white/20 text-white",
    text: "text-white",
    muted: "text-white/75",
    trend: { pos: "text-lime-200", neg: "text-red-200" },
  },
  red: {
    bg: "bg-gradient-to-br from-red-500 to-red-700",
    icon: "bg-white/20 text-white",
    text: "text-white",
    muted: "text-white/75",
    trend: { pos: "text-emerald-200", neg: "text-amber-200" },
  },
};

export default function StatsCard({
  title,
  value,
  icon,
  trend,
  className,
  iconClassName,
  colorVariant,
  index = 0,
}: StatsCardProps) {
  const colors = colorVariant ? colorMap[colorVariant] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className={cn(
        "rounded-xl p-5 shadow-sm transition-shadow hover:shadow-md",
        colors ? colors.bg : "border bg-card",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p
          className={cn(
            "text-sm font-medium",
            colors ? colors.muted : "text-muted-foreground"
          )}
        >
          {title}
        </p>
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-lg",
            colors
              ? colors.icon
              : iconClassName || "bg-nexifi-orange/10 text-nexifi-orange"
          )}
        >
          {icon}
        </div>
      </div>
      <p
        className={cn(
          "mt-3 text-2xl font-bold tracking-tight",
          colors ? colors.text : ""
        )}
      >
        {value}
      </p>
      {trend && (
        <p
          className={cn(
            "mt-1 text-xs font-medium",
            colors
              ? trend.isPositive
                ? colors.trend.pos
                : colors.trend.neg
              : trend.isPositive
                ? "text-emerald-600"
                : "text-red-500"
          )}
        >
          {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}% from last
          month
        </p>
      )}
    </motion.div>
  );
}
