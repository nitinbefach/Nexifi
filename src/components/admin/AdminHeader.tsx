// AdminHeader: Will display the admin panel header with breadcrumbs, search,
// notification bell, and admin user avatar/menu.

"use client";

import React from "react";

export default function AdminHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b px-6">
      <h1 className="text-lg font-semibold">Dashboard</h1>
      <p className="text-sm text-muted-foreground">Admin header placeholder</p>
    </header>
  );
}
