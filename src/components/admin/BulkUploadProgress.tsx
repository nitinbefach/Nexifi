// BulkUploadProgress: Will display a progress bar and status updates during
// bulk product import processing with success/failure counts.

"use client";

import React from "react";

export default function BulkUploadProgress() {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-semibold">Upload Progress</h3>
      <div className="mt-4 h-2 w-full rounded-full bg-muted">
        <div className="h-2 w-0 rounded-full bg-primary" />
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Bulk upload progress placeholder — coming soon
      </p>
    </div>
  );
}
