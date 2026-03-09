// WhatsAppWidget: Will display a floating WhatsApp chat button in the bottom-right corner.
// Opens WhatsApp with a pre-filled message to the store's support number.

"use client";

import React from "react";

export default function WhatsAppWidget() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button className="rounded-full bg-green-500 p-3 text-white shadow-lg" disabled>
        WhatsApp
      </button>
    </div>
  );
}
