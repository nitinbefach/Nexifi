"use client";

import React from "react";
import { CheckCircle2, XCircle, Loader2, AlertTriangle } from "lucide-react";
import Link from "next/link";

export interface UploadResult {
  success: number;
  failed: number;
  total: number;
  errors: { row: number; messages: string[] }[];
  message: string;
}

interface BulkUploadProgressProps {
  isUploading: boolean;
  result: UploadResult | null;
  error: string | null;
}

export default function BulkUploadProgress({
  isUploading,
  result,
  error,
}: BulkUploadProgressProps) {
  if (isUploading) {
    return (
      <div className="rounded-lg border p-6 text-center">
        <Loader2 className="mx-auto size-8 animate-spin text-nexifi-orange" />
        <h3 className="mt-3 text-sm font-semibold">Processing your file...</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Validating rows and creating products. This may take a moment.
        </p>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-2 animate-pulse rounded-full bg-nexifi-orange w-2/3" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/30">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-red-500" />
          <div>
            <h3 className="text-sm font-semibold text-red-700 dark:text-red-400">
              Upload Failed
            </h3>
            <p className="mt-1 text-sm text-red-600 dark:text-red-300">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="space-y-4">
      {/* Summary card */}
      <div className="rounded-lg border p-6">
        <div className="flex items-center gap-3">
          {result.success > 0 ? (
            <CheckCircle2 className="size-8 text-green-500" />
          ) : (
            <XCircle className="size-8 text-red-500" />
          )}
          <div>
            <h3 className="text-lg font-semibold">{result.message}</h3>
            <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="text-green-600">
                {result.success} succeeded
              </span>
              {result.failed > 0 && (
                <span className="text-red-500">
                  {result.failed} failed
                </span>
              )}
              <span>{result.total} total rows</span>
            </div>
          </div>
        </div>

        {result.success > 0 && (
          <Link
            href="/admin/products"
            className="mt-4 inline-block text-sm font-medium text-nexifi-orange hover:underline"
          >
            View products &rarr;
          </Link>
        )}
      </div>

      {/* Error details */}
      {result.errors.length > 0 && (
        <div className="rounded-lg border">
          <div className="border-b bg-muted/50 px-4 py-3">
            <h4 className="text-sm font-semibold text-red-600">
              Errors ({result.errors.length})
            </h4>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {result.errors.map((err, i) => (
              <div
                key={i}
                className="flex items-start gap-3 border-b px-4 py-2 last:border-0"
              >
                <span className="shrink-0 rounded bg-red-100 px-1.5 py-0.5 text-xs font-mono text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  Row {err.row}
                </span>
                <p className="text-xs text-muted-foreground">
                  {err.messages.join("; ")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
