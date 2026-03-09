// SocialShare: Will provide share buttons for WhatsApp, Facebook, Twitter, and
// copy-link functionality for sharing product pages.

"use client";

import React from "react";

export default function SocialShare() {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Share:</span>
      <button className="rounded border px-2 py-1 text-xs" disabled>WhatsApp</button>
      <button className="rounded border px-2 py-1 text-xs" disabled>Facebook</button>
      <button className="rounded border px-2 py-1 text-xs" disabled>Twitter</button>
      <button className="rounded border px-2 py-1 text-xs" disabled>Copy Link</button>
    </div>
  );
}
