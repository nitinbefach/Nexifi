"use client";

import { useCallback, useRef, useState } from "react";
import { Plus, Pencil, Trash2, X, Loader2, Image as ImageIcon, Upload, Info, CheckCircle2, AlertTriangle } from "lucide-react";

const RECOMMENDED = {
  desktop: { w: 1920, h: 500 },
  mobile: { w: 768, h: 280 },
} as const;

function getDimStatus(actual: { w: number; h: number }, type: "desktop" | "mobile") {
  const rec = RECOMMENDED[type];
  const aspectActual = actual.w / actual.h;
  const aspectRec = rec.w / rec.h;
  const aspectDiff = Math.abs(aspectActual - aspectRec) / aspectRec;

  if (actual.w === rec.w && actual.h === rec.h) return "perfect";
  if (aspectDiff < 0.15 && actual.w >= rec.w * 0.8) return "good";
  return "warning";
}

interface Banner {
  id: string;
  title: string | null;
  image_url: string;
  mobile_image_url: string | null;
  link_url: string | null;
  sort_order: number;
  is_active: boolean;
}

interface Props {
  initialBanners: Banner[];
}

export default function BannersClient({ initialBanners }: Props) {
  const [banners, setBanners] = useState(initialBanners);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState<"desktop" | "mobile" | null>(null);
  const desktopFileRef = useRef<HTMLInputElement>(null);
  const mobileFileRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formMobileImageUrl, setFormMobileImageUrl] = useState("");
  const [formLinkUrl, setFormLinkUrl] = useState("");
  const [formSortOrder, setFormSortOrder] = useState(0);
  const [formIsActive, setFormIsActive] = useState(true);

  // Dimension detection state
  const [desktopDims, setDesktopDims] = useState<{ w: number; h: number } | null>(null);
  const [mobileDims, setMobileDims] = useState<{ w: number; h: number } | null>(null);

  const detectDimensions = useCallback((url: string, target: "desktop" | "mobile") => {
    const setDims = target === "desktop" ? setDesktopDims : setMobileDims;
    if (!url.trim()) {
      setDims(null);
      return;
    }
    const img = new window.Image();
    img.onload = () => setDims({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => setDims(null);
    img.src = url;
  }, []);

  const resetForm = () => {
    setFormTitle("");
    setFormImageUrl("");
    setFormMobileImageUrl("");
    setFormLinkUrl("");
    setFormSortOrder(0);
    setFormIsActive(true);
    setEditingId(null);
    setShowAdd(false);
    setError("");
    setDesktopDims(null);
    setMobileDims(null);
  };

  const startEdit = (b: Banner) => {
    setEditingId(b.id);
    setShowAdd(false);
    setFormTitle(b.title || "");
    setFormImageUrl(b.image_url);
    setFormMobileImageUrl(b.mobile_image_url || "");
    setFormLinkUrl(b.link_url || "");
    setFormSortOrder(b.sort_order);
    setFormIsActive(b.is_active);
    setError("");
    detectDimensions(b.image_url, "desktop");
    if (b.mobile_image_url) detectDimensions(b.mobile_image_url, "mobile");
    else setMobileDims(null);
  };

  const startAdd = () => {
    resetForm();
    setFormSortOrder(banners.length + 1);
    setShowAdd(true);
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "desktop" | "mobile"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(target);
    setError("");

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

      if (target === "desktop") {
        setFormImageUrl(url);
        detectDimensions(url, "desktop");
      } else {
        setFormMobileImageUrl(url);
        detectDimensions(url, "mobile");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(null);
      // Reset input so same file can be re-selected
      if (target === "desktop" && desktopFileRef.current) desktopFileRef.current.value = "";
      if (target === "mobile" && mobileFileRef.current) mobileFileRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!formImageUrl.trim()) {
      setError("Image URL is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const isEdit = !!editingId;
      const url = isEdit ? `/api/admin/banners/${editingId}` : "/api/admin/banners";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle.trim() || null,
          image_url: formImageUrl.trim(),
          mobile_image_url: formMobileImageUrl.trim() || null,
          link_url: formLinkUrl.trim() || null,
          sort_order: formSortOrder,
          is_active: formIsActive,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      const data = await res.json();

      if (isEdit) {
        setBanners(banners.map((b) => (b.id === editingId ? data.banner : b)));
      } else {
        setBanners([...banners, data.banner].sort((a, b) => a.sort_order - b.sort_order));
      }

      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this banner?")) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      setBanners(banners.filter((b) => b.id !== id));
    } catch {
      setError("Failed to delete banner");
    } finally {
      setLoading(false);
    }
  };

  const showForm = showAdd || editingId;

  const renderDimStatus = (dims: { w: number; h: number } | null, type: "desktop" | "mobile") => {
    if (!dims) return null;
    const status = getDimStatus(dims, type);
    const rec = RECOMMENDED[type];
    return (
      <div className={`mt-1.5 flex items-center gap-1 text-xs ${
        status === "perfect" ? "text-green-600" :
        status === "good" ? "text-green-600" :
        "text-amber-600"
      }`}>
        {status === "warning" ? (
          <AlertTriangle className="size-3.5" />
        ) : (
          <CheckCircle2 className="size-3.5" />
        )}
        <span>
          {dims.w} x {dims.h}px
          {status === "perfect" && " — Perfect match!"}
          {status === "good" && " — Good aspect ratio"}
          {status === "warning" && ` — Recommended: ${rec.w} x ${rec.h}px`}
        </span>
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Banners</h2>
          <p className="mt-1 text-sm text-gray-500">
            {banners.length} banner{banners.length !== 1 ? "s" : ""} — displayed on the storefront hero section.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={startAdd}
            className="flex items-center gap-2 rounded-lg bg-nexifi-orange px-4 py-2 text-sm font-medium text-white hover:bg-nexifi-orange-dark"
          >
            <Plus className="size-4" /> Add Banner
          </button>
        )}
      </div>

      {error && (
        <p className="mt-3 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>
      )}

      {/* Inline Form */}
      {showForm && (
        <div className="mt-4 rounded-lg bg-white p-5 shadow">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              {editingId ? "Edit Banner" : "New Banner"}
            </h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
              <X className="size-5" />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Dimension Guide */}
            <div className="sm:col-span-2 rounded-lg border border-orange-200 bg-orange-50 p-3">
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 size-4 shrink-0 text-orange-500" />
                <div className="text-sm text-orange-800">
                  <p className="font-medium">Recommended Image Sizes</p>
                  <div className="mt-1.5 grid gap-1 text-xs sm:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-orange-100 px-1.5 py-0.5 font-medium">Desktop</span>
                      <span>{RECOMMENDED.desktop.w} x {RECOMMENDED.desktop.h} px (wide landscape)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-orange-100 px-1.5 py-0.5 font-medium">Mobile</span>
                      <span>{RECOMMENDED.mobile.w} x {RECOMMENDED.mobile.h} px (landscape)</span>
                    </div>
                  </div>
                  <p className="mt-1.5 text-xs text-orange-600">
                    Accepted formats: JPG, PNG, WebP (max 5 MB)
                  </p>
                </div>
              </div>
            </div>

            {/* Desktop Image */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Desktop Image <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  onBlur={() => detectDimensions(formImageUrl, "desktop")}
                  placeholder="https://example.com/banner.jpg"
                  className="flex-1 rounded-md border px-3 py-2 text-sm focus:border-nexifi-orange focus:outline-none focus:ring-1 focus:ring-nexifi-orange"
                />
                <button
                  type="button"
                  onClick={() => desktopFileRef.current?.click()}
                  disabled={uploading === "desktop"}
                  className="flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {uploading === "desktop" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Upload className="size-4" />
                  )}
                  Upload
                </button>
              </div>
              <input
                ref={desktopFileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handleFileUpload(e, "desktop")}
                className="hidden"
              />
            </div>

            {/* Mobile Image */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Mobile Image <span className="text-xs text-gray-400">(optional)</span>
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  value={formMobileImageUrl}
                  onChange={(e) => setFormMobileImageUrl(e.target.value)}
                  onBlur={() => detectDimensions(formMobileImageUrl, "mobile")}
                  placeholder="https://example.com/banner-mobile.jpg"
                  className="flex-1 rounded-md border px-3 py-2 text-sm focus:border-nexifi-orange focus:outline-none focus:ring-1 focus:ring-nexifi-orange"
                />
                <button
                  type="button"
                  onClick={() => mobileFileRef.current?.click()}
                  disabled={uploading === "mobile"}
                  className="flex items-center gap-1.5 rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  {uploading === "mobile" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Upload className="size-4" />
                  )}
                  Upload
                </button>
              </div>
              <input
                ref={mobileFileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handleFileUpload(e, "mobile")}
                className="hidden"
              />
            </div>

            {/* Enhanced Preview */}
            {(formImageUrl || formMobileImageUrl) && (
              <div className="sm:col-span-2">
                <p className="mb-2 text-xs font-medium text-gray-500">Preview</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Desktop Preview */}
                  {formImageUrl && (
                    <div>
                      <p className="mb-1 text-xs font-medium text-gray-600">Desktop</p>
                      <div className="relative overflow-hidden rounded-lg border bg-gray-100" style={{ aspectRatio: `${RECOMMENDED.desktop.w} / ${RECOMMENDED.desktop.h}` }}>
                        <img
                          src={formImageUrl}
                          alt="Desktop preview"
                          className="size-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                        {desktopDims && (
                          <span className="absolute bottom-1.5 right-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                            {desktopDims.w} x {desktopDims.h}
                          </span>
                        )}
                      </div>
                      {renderDimStatus(desktopDims, "desktop")}
                    </div>
                  )}

                  {/* Mobile Preview */}
                  <div>
                    <p className="mb-1 text-xs font-medium text-gray-600">Mobile</p>
                    {formMobileImageUrl ? (
                      <>
                        <div className="relative overflow-hidden rounded-lg border bg-gray-100" style={{ aspectRatio: `${RECOMMENDED.mobile.w} / ${RECOMMENDED.mobile.h}` }}>
                          <img
                            src={formMobileImageUrl}
                            alt="Mobile preview"
                            className="size-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                          {mobileDims && (
                            <span className="absolute bottom-1.5 right-1.5 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                              {mobileDims.w} x {mobileDims.h}
                            </span>
                          )}
                        </div>
                        {renderDimStatus(mobileDims, "mobile")}
                      </>
                    ) : (
                      <div className="flex items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 py-6 text-center" style={{ aspectRatio: `${RECOMMENDED.mobile.w} / ${RECOMMENDED.mobile.h}` }}>
                        <p className="text-xs text-gray-400">
                          No mobile image — desktop image will be used on all screen sizes
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="Hero Banner"
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-nexifi-orange focus:outline-none focus:ring-1 focus:ring-nexifi-orange"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Link URL</label>
              <input
                value={formLinkUrl}
                onChange={(e) => setFormLinkUrl(e.target.value)}
                placeholder="/products or https://..."
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-nexifi-orange focus:outline-none focus:ring-1 focus:ring-nexifi-orange"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Sort Order</label>
              <input
                type="number"
                value={formSortOrder}
                onChange={(e) => setFormSortOrder(Number(e.target.value))}
                className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-nexifi-orange focus:outline-none focus:ring-1 focus:ring-nexifi-orange"
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 pb-2 text-sm">
                <input
                  type="checkbox"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="rounded border-gray-300 text-nexifi-orange focus:ring-nexifi-orange"
                />
                Active
              </label>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={resetForm}
              className="rounded-md border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 rounded-md bg-nexifi-orange px-4 py-2 text-sm font-medium text-white hover:bg-nexifi-orange-dark disabled:opacity-50"
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              {editingId ? "Update" : "Create"}
            </button>
          </div>
        </div>
      )}

      {/* Banner Grid */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {banners.length === 0 ? (
          <div className="col-span-full rounded-lg bg-white py-16 text-center shadow">
            <ImageIcon className="mx-auto size-10 text-gray-300" />
            <p className="mt-3 text-sm text-gray-400">No banners yet. Add one to get started.</p>
          </div>
        ) : (
          banners.map((b) => (
            <div
              key={b.id}
              className={`overflow-hidden rounded-lg bg-white shadow ${
                !b.is_active ? "opacity-60" : ""
              }`}
            >
              <div className="relative h-40 bg-gray-200">
                <img
                  src={b.image_url}
                  alt={b.title || "Banner"}
                  className="size-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                {!b.is_active && (
                  <span className="absolute right-2 top-2 rounded bg-gray-800/70 px-2 py-0.5 text-xs text-white">
                    Inactive
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">
                      {b.title || "Untitled Banner"}
                    </p>
                    <span className="rounded bg-orange-50 px-1.5 py-0.5 text-[10px] font-medium text-orange-600">
                      Hero Banner
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Position: {b.sort_order}
                    {b.link_url && ` · Links to ${b.link_url}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(b)}
                    className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    title="Edit"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    title="Delete"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
