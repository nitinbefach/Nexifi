// BulkUploadDropzone: Will provide a drag-and-drop zone for uploading Excel files
// for bulk product import with file validation and format checking.

"use client";

import React from "react";

export default function BulkUploadDropzone() {
  return (
    <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed">
      <p className="text-sm text-muted-foreground">
        Drag and drop Excel file here — coming soon
      </p>
    </div>
  );
}
