"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import * as XLSX from "xlsx";
import { bulkProductRowSchema } from "@/validators/bulk-product.schema";
import BulkUploadDropzone from "@/components/admin/BulkUploadDropzone";
import BulkUploadPreview, {
  type PreviewRow,
} from "@/components/admin/BulkUploadPreview";
import BulkUploadProgress, {
  type UploadResult,
} from "@/components/admin/BulkUploadProgress";
import { toast } from "sonner";

type Step = "select" | "preview" | "uploading" | "done";

export default function BulkUploadPage() {
  const [step, setStep] = useState<Step>("select");
  const [file, setFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setUploadError(null);
    setUploadResult(null);

    try {
      // Parse client-side for preview
      const buffer = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

      if (rows.length === 0) {
        toast.error("File is empty or has no data rows.");
        setFile(null);
        return;
      }

      // Validate each row for preview
      const preview: PreviewRow[] = rows.map((rawRow, i) => {
        const result = bulkProductRowSchema.safeParse(rawRow);

        if (result.success) {
          return {
            row: i + 2,
            name: result.data.name,
            category: result.data.category,
            original_price: result.data.original_price,
            selling_price: result.data.selling_price,
            stock_quantity: result.data.stock_quantity,
            isValid: true,
            errors: [],
          };
        }

        return {
          row: i + 2,
          name: String(rawRow.name || ""),
          category: String(rawRow.category || ""),
          original_price: Number(rawRow.original_price) || 0,
          selling_price: Number(rawRow.selling_price) || 0,
          stock_quantity: Number(rawRow.stock_quantity) || 0,
          isValid: false,
          errors: result.error.issues.map(
            (issue) => `${issue.path.join(".")}: ${issue.message}`
          ),
        };
      });

      setPreviewRows(preview);
      setStep("preview");
    } catch {
      toast.error("Failed to parse the file. Please check the format.");
      setFile(null);
    }
  }, []);

  const handleClear = useCallback(() => {
    setFile(null);
    setPreviewRows([]);
    setStep("select");
    setUploadError(null);
    setUploadResult(null);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!file) return;

    const validCount = previewRows.filter((r) => r.isValid).length;
    if (validCount === 0) {
      toast.error("No valid rows to upload. Please fix the errors first.");
      return;
    }

    setStep("uploading");
    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/bulk-upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error || "Upload failed");
        setStep("done");
        return;
      }

      setUploadResult(data as UploadResult);
      setStep("done");

      if (data.success > 0) {
        toast.success(`${data.success} products imported successfully!`);
      }
    } catch {
      setUploadError("Network error. Please try again.");
      setStep("done");
    } finally {
      setIsUploading(false);
    }
  }, [file, previewRows]);

  const handleDownloadTemplate = useCallback(() => {
    window.open("/api/admin/bulk-template", "_blank");
  }, []);

  const validCount = previewRows.filter((r) => r.isValid).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/products"
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to Products
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">
          Bulk Upload Products
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload a CSV or Excel file to add multiple products to your NEXIFI
          store at once.
        </p>
      </div>

      <div className="max-w-4xl space-y-6">
        {/* Template Download */}
        <div className="flex items-center justify-between rounded-lg border bg-card p-4 shadow-sm">
          <div>
            <p className="text-sm font-medium">Download Template</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Use this CSV template to format your product data correctly
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Download className="size-4" /> Download
          </button>
        </div>

        {/* Step: Select File */}
        {(step === "select" || step === "preview") && (
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <BulkUploadDropzone
              onFileSelect={handleFileSelect}
              selectedFile={file}
              onClear={handleClear}
            />

            {/* Preview */}
            {step === "preview" && previewRows.length > 0 && (
              <div className="mt-6 space-y-4">
                <BulkUploadPreview rows={previewRows} />

                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {validCount} of {previewRows.length} rows will be imported
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleClear}
                      className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleUpload}
                      disabled={validCount === 0}
                      className="rounded-lg bg-nexifi-orange px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-nexifi-orange-dark disabled:opacity-50"
                    >
                      Upload {validCount} Products
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step: Uploading / Done */}
        {(step === "uploading" || step === "done") && (
          <BulkUploadProgress
            isUploading={isUploading}
            result={uploadResult}
            error={uploadError}
          />
        )}

        {/* Reset after done */}
        {step === "done" && (
          <button
            type="button"
            onClick={handleClear}
            className="text-sm font-medium text-nexifi-orange hover:underline"
          >
            Upload another file
          </button>
        )}
      </div>
    </div>
  );
}
