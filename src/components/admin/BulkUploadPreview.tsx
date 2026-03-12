"use client";

import React from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

export interface PreviewRow {
  row: number;
  name: string;
  category: string;
  original_price: number;
  selling_price: number;
  stock_quantity: number;
  isValid: boolean;
  errors: string[];
}

interface BulkUploadPreviewProps {
  rows: PreviewRow[];
}

export default function BulkUploadPreview({ rows }: BulkUploadPreviewProps) {
  const validCount = rows.filter((r) => r.isValid).length;
  const invalidCount = rows.length - validCount;

  return (
    <div className="rounded-lg border">
      {/* Summary bar */}
      <div className="flex items-center gap-4 border-b bg-muted/50 px-4 py-3">
        <h3 className="text-sm font-semibold">Preview</h3>
        <span className="text-xs text-muted-foreground">
          {rows.length} rows found
        </span>
        <div className="ml-auto flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-green-600">
            <CheckCircle2 className="size-3.5" /> {validCount} valid
          </span>
          {invalidCount > 0 && (
            <span className="flex items-center gap-1 text-red-500">
              <XCircle className="size-3.5" /> {invalidCount} invalid
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30 text-left text-xs text-muted-foreground">
              <th className="px-3 py-2 w-12">#</th>
              <th className="px-3 py-2 w-10">Status</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2 text-right">Original</th>
              <th className="px-3 py-2 text-right">Selling</th>
              <th className="px-3 py-2 text-right">Stock</th>
              <th className="px-3 py-2">Errors</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.row}
                className={cn(
                  "border-b transition-colors",
                  !row.isValid && "bg-red-50 dark:bg-red-950/20"
                )}
              >
                <td className="px-3 py-2 text-xs text-muted-foreground">
                  {row.row}
                </td>
                <td className="px-3 py-2">
                  {row.isValid ? (
                    <CheckCircle2 className="size-4 text-green-500" />
                  ) : (
                    <XCircle className="size-4 text-red-500" />
                  )}
                </td>
                <td className="max-w-[200px] truncate px-3 py-2 font-medium">
                  {row.name || "—"}
                </td>
                <td className="px-3 py-2">{row.category || "—"}</td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {row.original_price ? formatCurrency(row.original_price) : "—"}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {row.selling_price ? formatCurrency(row.selling_price) : "—"}
                </td>
                <td className="px-3 py-2 text-right tabular-nums">
                  {row.stock_quantity ?? "—"}
                </td>
                <td className="max-w-[250px] px-3 py-2">
                  {row.errors.length > 0 && (
                    <p className="truncate text-xs text-red-500">
                      {row.errors.join("; ")}
                    </p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
