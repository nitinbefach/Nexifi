// AdminSidebar: Will display the admin panel sidebar with navigation links to
// dashboard, products, orders, customers, coupons, and settings pages.

"use client";

import React from "react";

export default function AdminSidebar() {
  return (
    <aside className="hidden h-screen w-64 border-r bg-background p-6 md:block">
      <h2 className="mb-6 text-lg font-bold">Admin Panel</h2>
      <nav className="space-y-2">
        <p className="text-sm text-muted-foreground">Sidebar placeholder — coming soon</p>
      </nav>
    </aside>
  );
}
