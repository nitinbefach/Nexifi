"use client";

import { CheckCircle, Circle, XCircle } from "lucide-react";

const TRACKING_STEPS = [
  { key: "pending", label: "Order Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
] as const;

interface Props {
  currentStatus: string;
  createdAt: string;
  updatedAt: string;
}

export default function OrderTimeline({ currentStatus, createdAt, updatedAt }: Props) {
  const isCancelled = currentStatus === "cancelled";
  const isReturned = currentStatus === "returned";
  const isTerminal = isCancelled || isReturned;

  const currentIndex = TRACKING_STEPS.findIndex((s) => s.key === currentStatus);
  // If status is not in the tracking steps (cancelled/returned), use the last known step
  const activeIndex = currentIndex >= 0 ? currentIndex : TRACKING_STEPS.length;

  return (
    <div>
      <div className="space-y-0">
        {TRACKING_STEPS.map((step, index) => {
          const isCompleted = index < activeIndex;
          const isCurrent = index === activeIndex && !isTerminal;
          const isFuture = index > activeIndex;

          return (
            <div key={step.key} className="flex items-start gap-3">
              {/* Connector + Icon */}
              <div className="flex flex-col items-center">
                {isCompleted ? (
                  <CheckCircle className="size-6 shrink-0 text-green-500" />
                ) : isCurrent ? (
                  <Circle className="size-6 shrink-0 fill-nexifi-orange text-nexifi-orange" />
                ) : (
                  <Circle className="size-6 shrink-0 text-gray-300" />
                )}
                {index < TRACKING_STEPS.length - 1 && (
                  <div
                    className={`h-8 w-0.5 ${
                      isCompleted ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>

              {/* Label */}
              <div className="pb-8 last:pb-0">
                <p
                  className={`text-sm font-medium ${
                    isCompleted
                      ? "text-green-700"
                      : isCurrent
                        ? "text-nexifi-orange"
                        : "text-gray-400"
                  }`}
                >
                  {step.label}
                </p>
                {index === 0 && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
                {isCurrent && !isFuture && index > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {new Date(updatedAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Terminal status badge */}
      {isTerminal && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3">
          <XCircle className="size-5 text-red-500" />
          <span className="text-sm font-medium text-red-700">
            {isCancelled ? "Order Cancelled" : "Order Returned"}
          </span>
        </div>
      )}
    </div>
  );
}
