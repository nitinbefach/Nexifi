"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import ImageUploader, { type ProductImage } from "./ImageUploader";

interface Category {
  id: string;
  name: string;
}

interface ExistingImage {
  id: string;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
}

interface ProductData {
  id?: string;
  name?: string;
  description?: string;
  short_description?: string;
  category_id?: string;
  original_price?: number;
  selling_price?: number;
  sku?: string;
  stock_quantity?: number;
  is_active?: boolean;
  is_featured?: boolean;
  is_trending?: boolean;
  images?: ExistingImage[];
}

interface Props {
  product?: ProductData;
  categories: Category[];
}

export default function ProductForm({ product, categories }: Props) {
  const router = useRouter();
  const isEdit = !!product?.id;

  const [form, setForm] = useState({
    name: product?.name || "",
    description: product?.description || "",
    short_description: product?.short_description || "",
    category_id: product?.category_id || "",
    original_price: product?.original_price ?? 0,
    selling_price: product?.selling_price ?? 0,
    sku: product?.sku || "",
    stock_quantity: product?.stock_quantity ?? 0,
    is_active: product?.is_active ?? true,
    is_featured: product?.is_featured ?? false,
    is_trending: product?.is_trending ?? false,
  });

  const [images, setImages] = useState<ProductImage[]>(
    product?.images?.map((img) => ({
      url: img.image_url,
      is_primary: img.is_primary,
    })) ?? []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
            ? Number(value)
            : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError("Product name is required");
      return;
    }
    if (form.selling_price <= 0) {
      setError("Selling price must be greater than 0");
      return;
    }

    setLoading(true);
    setError("");

    const slug = form.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const body = {
      name: form.name.trim(),
      slug,
      description: form.description.trim() || null,
      short_description: form.short_description.trim() || null,
      category_id: form.category_id || null,
      original_price: form.original_price || form.selling_price,
      selling_price: form.selling_price,
      sku: form.sku.trim() || null,
      stock_quantity: form.stock_quantity,
      is_active: form.is_active,
      is_featured: form.is_featured,
      is_trending: form.is_trending,
      images: images.map((img, i) => ({
        image_url: img.url,
        is_primary: img.is_primary,
        sort_order: i,
      })),
    };

    try {
      const url = isEdit
        ? `/api/admin/products/${product!.id}`
        : "/api/admin/products";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `Failed to ${isEdit ? "update" : "create"} product`);
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-3xl space-y-5 rounded-lg bg-white p-6 shadow">
      {error && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Product Name *</label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-nexifi-orange focus:outline-none focus:ring-1 focus:ring-nexifi-orange"
        />
      </div>

      {/* Short Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Short Description</label>
        <input
          type="text"
          name="short_description"
          value={form.short_description}
          onChange={handleChange}
          placeholder="Brief tagline for product cards"
          className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-nexifi-orange focus:outline-none focus:ring-1 focus:ring-nexifi-orange"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={4}
          className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-nexifi-orange focus:outline-none focus:ring-1 focus:ring-nexifi-orange"
        />
      </div>

      {/* Product Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Product Images</label>
        <ImageUploader images={images} onImagesChange={setImages} />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Category</label>
        <select
          name="category_id"
          value={form.category_id}
          onChange={handleChange}
          className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-nexifi-orange focus:outline-none focus:ring-1 focus:ring-nexifi-orange"
        >
          <option value="">Select category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Pricing */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Original Price (MRP)</label>
          <input
            type="number"
            name="original_price"
            value={form.original_price}
            onChange={handleChange}
            min={0}
            step={0.01}
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-nexifi-orange focus:outline-none focus:ring-1 focus:ring-nexifi-orange"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Selling Price *</label>
          <input
            type="number"
            name="selling_price"
            value={form.selling_price}
            onChange={handleChange}
            min={0}
            step={0.01}
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-nexifi-orange focus:outline-none focus:ring-1 focus:ring-nexifi-orange"
          />
        </div>
      </div>

      {/* SKU & Stock */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">SKU</label>
          <input
            type="text"
            name="sku"
            value={form.sku}
            onChange={handleChange}
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-nexifi-orange focus:outline-none focus:ring-1 focus:ring-nexifi-orange"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
          <input
            type="number"
            name="stock_quantity"
            value={form.stock_quantity}
            onChange={handleChange}
            min={0}
            className="mt-1 w-full rounded-md border px-3 py-2 text-sm focus:border-nexifi-orange focus:outline-none focus:ring-1 focus:ring-nexifi-orange"
          />
        </div>
      </div>

      {/* Toggles */}
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="is_active"
            checked={form.is_active}
            onChange={handleChange}
            className="rounded accent-nexifi-orange"
          />
          Active
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="is_featured"
            checked={form.is_featured}
            onChange={handleChange}
            className="rounded accent-nexifi-orange"
          />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="is_trending"
            checked={form.is_trending}
            onChange={handleChange}
            className="rounded accent-nexifi-orange"
          />
          Trending
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-md bg-nexifi-orange px-6 py-2 text-sm font-medium text-white hover:bg-nexifi-orange-dark disabled:opacity-50"
        >
          {loading && <Loader2 className="size-4 animate-spin" />}
          {isEdit ? "Update Product" : "Create Product"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="rounded-md border px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
