// InvoiceTemplate: Will render a printable/PDF invoice with company details,
// customer info, itemized products, taxes, and total amount.

import React from "react";

export default function InvoiceTemplate() {
  return (
    <div className="rounded-lg border p-6">
      <h3 className="text-lg font-bold">INVOICE</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Invoice template placeholder — coming soon
      </p>
    </div>
  );
}
