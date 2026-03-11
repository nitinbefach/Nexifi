"use client";

import { useRef, useState } from "react";
import { Upload, X, Star, Loader2, Link } from "lucide-react";

export interface ProductImage {
  url: string;
  is_primary: boolean;
}

interface Props {
  images: ProductImage[];
  onImagesChange: (images: ProductImage[]) => void;
}

export default function ImageUploader({ images, onImagesChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError("");

    const newImages: ProductImage[] = [];

    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Upload failed");
        }

        const { url } = await res.json();
        newImages.push({
          url,
          is_primary: images.length === 0 && newImages.length === 0, // First image is primary
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      }
    }

    if (newImages.length > 0) {
      onImagesChange([...images, ...newImages]);
    }

    setUploading(false);
    // Reset input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    // If we removed the primary, make the first one primary
    if (updated.length > 0 && !updated.some((img) => img.is_primary)) {
      updated[0].is_primary = true;
    }
    onImagesChange(updated);
  };

  const setPrimary = (index: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      is_primary: i === index,
    }));
    onImagesChange(updated);
  };

  const addByUrl = () => {
    const url = urlInput.trim();
    if (!url) return;

    // Basic URL validation
    try {
      new URL(url);
    } catch {
      setError("Please enter a valid URL");
      return;
    }

    const newImage: ProductImage = {
      url,
      is_primary: images.length === 0,
    };

    onImagesChange([...images, newImage]);
    setUrlInput("");
    setError("");
  };

  return (
    <div>
      {error && (
        <p className="mb-2 text-xs text-red-600">{error}</p>
      )}

      {/* Image Previews */}
      {images.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-3">
          {images.map((img, index) => (
            <div
              key={img.url}
              className={`group relative size-24 overflow-hidden rounded-lg border-2 ${
                img.is_primary ? "border-nexifi-orange" : "border-border"
              }`}
            >
              <img
                src={img.url}
                alt={`Product image ${index + 1}`}
                className="size-full object-cover"
              />

              {/* Overlay buttons */}
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => setPrimary(index)}
                  title="Set as primary"
                  className={`rounded p-1 ${
                    img.is_primary
                      ? "text-nexifi-orange"
                      : "text-white hover:text-nexifi-orange"
                  }`}
                >
                  <Star className="size-4" fill={img.is_primary ? "currentColor" : "none"} />
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  title="Remove"
                  className="rounded p-1 text-white hover:text-red-400"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Primary badge */}
              {img.is_primary && (
                <span className="absolute bottom-0 left-0 right-0 bg-nexifi-orange px-1 py-0.5 text-center text-[10px] font-medium text-white">
                  Primary
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border px-4 py-6 text-sm text-muted-foreground transition-colors hover:border-nexifi-orange hover:text-nexifi-orange disabled:opacity-50"
      >
        {uploading ? (
          <>
            <Loader2 className="size-5 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="size-5" />
            Click to upload images (JPEG, PNG, WebP — max 5MB)
          </>
        )}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Add by URL */}
      <div className="mt-2">
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-nexifi-orange"
        >
          <Link className="size-3" />
          {showUrlInput ? "Hide URL input" : "Or add image by URL"}
        </button>

        {showUrlInput && (
          <div className="mt-1.5 flex gap-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addByUrl())}
              placeholder="https://example.com/image.jpg"
              className="flex-1 rounded-md border px-3 py-1.5 text-sm focus:border-nexifi-orange focus:outline-none focus:ring-1 focus:ring-nexifi-orange"
            />
            <button
              type="button"
              onClick={addByUrl}
              className="rounded-md bg-nexifi-orange px-3 py-1.5 text-sm font-medium text-white hover:bg-nexifi-orange-dark"
            >
              Add
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
