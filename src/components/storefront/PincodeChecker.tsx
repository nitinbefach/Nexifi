// PincodeChecker: Will check delivery availability and estimated delivery date
// for a given pincode using the Shiprocket API.

"use client";

import React from "react";

export default function PincodeChecker() {
  return (
    <div className="flex gap-2">
      <input
        type="text"
        placeholder="Enter pincode"
        className="w-32 rounded-md border px-3 py-2 text-sm"
        disabled
      />
      <button className="rounded-md border px-3 py-2 text-sm" disabled>
        Check
      </button>
    </div>
  );
}
