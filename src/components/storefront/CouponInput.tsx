// CouponInput: Will provide an input field for applying coupon codes with validation,
// success/error messaging, and applied coupon display with remove option.

"use client";

import React from "react";

export default function CouponInput() {
  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="Enter coupon code"
        className="flex-1 rounded-md border px-3 py-2 text-sm"
        disabled
      />
      <button className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground" disabled>
        Apply
      </button>
    </div>
  );
}
