"use client";

import React, { useState } from "react";
import { Tag, X, Loader2 } from "lucide-react";

interface CouponInputProps {
  subtotal: number;
  onApply: (discount: { code: string; amount: number; description?: string }) => void;
  onRemove: () => void;
  appliedCode?: string;
  appliedAmount?: number;
}

export default function CouponInput({
  subtotal,
  onApply,
  onRemove,
  appliedCode,
  appliedAmount,
}: CouponInputProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleApply = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed, subtotal }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid coupon");
        return;
      }

      onApply({
        code: data.code,
        amount: data.discount_amount,
        description: data.description,
      });
      setCode("");
    } catch {
      setError("Failed to validate coupon");
    } finally {
      setLoading(false);
    }
  };

  if (appliedCode) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 dark:border-green-800 dark:bg-green-950">
        <div className="flex items-center gap-2">
          <Tag className="size-4 text-green-600" />
          <span className="text-sm font-medium text-green-700 dark:text-green-400">
            {appliedCode}
          </span>
          <span className="text-sm text-green-600 dark:text-green-500">
            -₹{appliedAmount?.toFixed(2)}
          </span>
        </div>
        <button
          onClick={onRemove}
          className="rounded-full p-1 text-green-600 transition-colors hover:bg-green-100 dark:hover:bg-green-900"
          aria-label="Remove coupon"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && handleApply()}
          placeholder="Enter coupon code"
          className="flex-1 rounded-lg border bg-background px-3 py-2 text-sm uppercase transition-colors focus:border-nexifi-orange focus:outline-none"
        />
        <button
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className="rounded-lg bg-nexifi-orange px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-nexifi-orange-dark disabled:opacity-50"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : "Apply"}
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
}
