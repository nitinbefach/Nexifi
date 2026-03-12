"use client";

import React, { useCallback, useRef, useState } from "react";
import { Upload, FileSpreadsheet, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BulkUploadDropzoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onClear: () => void;
}

const ACCEPTED = ".csv,.xlsx,.xls";
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export default function BulkUploadDropzone({
  onFileSelect,
  selectedFile,
  onClear,
}: BulkUploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAndSelect = useCallback(
    (file: File) => {
      setError(null);

      if (!file.name.match(/\.(csv|xlsx|xls)$/i)) {
        setError("Only CSV and Excel files are supported.");
        return;
      }

      if (file.size > MAX_SIZE) {
        setError("File too large. Maximum size is 5MB.");
        return;
      }

      onFileSelect(file);
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) validateAndSelect(file);
    },
    [validateAndSelect]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) validateAndSelect(file);
    },
    [validateAndSelect]
  );

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (selectedFile) {
    return (
      <div className="rounded-lg border-2 border-nexifi-orange/30 bg-nexifi-orange/5 p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-nexifi-orange/10">
            <FileSpreadsheet className="size-5 text-nexifi-orange" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {selectedFile.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatSize(selectedFile.size)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors",
          isDragging
            ? "border-nexifi-orange bg-nexifi-orange/5"
            : "border-border hover:border-nexifi-orange/50 hover:bg-muted/50"
        )}
      >
        <Upload
          className={cn(
            "mb-3 size-10",
            isDragging ? "text-nexifi-orange" : "text-muted-foreground"
          )}
        />
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-nexifi-orange">
            Click to upload
          </span>{" "}
          or drag and drop
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          CSV, XLSX, or XLS (max 5MB)
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
