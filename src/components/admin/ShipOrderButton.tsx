// ShipOrderButton: Will provide a button to initiate shipping for an order via
// Shiprocket API, with courier selection and label generation.

"use client";

import React from "react";

export default function ShipOrderButton() {
  return (
    <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" disabled>
      Ship Order
    </button>
  );
}
