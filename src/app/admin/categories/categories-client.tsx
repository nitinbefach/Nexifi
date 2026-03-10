"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, X, Loader2, ChevronDown, ChevronUp } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  product_count: number;
}

interface DropdownProduct {
  id: string;
  name: string;
  category_id: string | null;
}

interface Props {
  initialCategories: Category[];
  allProducts: DropdownProduct[];
}

export default function CategoriesClient({ initialCategories, allProducts }: Props) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [products, setProducts] = useState(allProducts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showProducts, setShowProducts] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formSortOrder, setFormSortOrder] = useState(0);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  const resetForm = () => {
    setFormName("");
    setFormDescription("");
    setFormSortOrder(0);
    setSelectedProductIds([]);
    setEditingId(null);
    setShowAdd(false);
    setShowProducts(false);
    setError("");
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setFormName(cat.name);
    setFormDescription(cat.description || "");
    setFormSortOrder(cat.sort_order);
    // Pre-select products that belong to this category
    setSelectedProductIds(
      products.filter((p) => p.category_id === cat.id).map((p) => p.id)
    );
    setShowAdd(false);
    setShowProducts(false);
    setError("");
  };

  const startAdd = () => {
    resetForm();
    setShowAdd(true);
  };

  const toggleProduct = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return null;
    return categories.find((c) => c.id === categoryId)?.name || null;
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      setError("Name is required");
      return;
    }

    setLoading(true);
    setError("");

    const slug = formName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const body: Record<string, unknown> = {
      name: formName.trim(),
      slug,
      description: formDescription.trim() || null,
      sort_order: formSortOrder,
    };

    // Only include product_ids when editing (not when creating — new category has no products yet)
    if (editingId) {
      body.product_ids = selectedProductIds;
    }

    try {
      if (editingId) {
        const res = await fetch(`/api/admin/categories/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to update");
        }
        const { category } = await res.json();
        setCategories((prev) =>
          prev.map((c) =>
            c.id === editingId
              ? { ...c, ...category, product_count: selectedProductIds.length }
              : c
          )
        );
        // Update local products state to reflect new category assignments
        setProducts((prev) =>
          prev.map((p) => {
            if (selectedProductIds.includes(p.id)) {
              return { ...p, category_id: editingId };
            }
            if (p.category_id === editingId && !selectedProductIds.includes(p.id)) {
              return { ...p, category_id: null };
            }
            return p;
          })
        );
      } else {
        const res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to create");
        }
        const { category } = await res.json();
        setCategories((prev) => [...prev, { ...category, product_count: 0 }]);
      }
      resetForm();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const cat = categories.find((c) => c.id === id);
    if (cat && cat.product_count > 0) {
      setError(`Cannot delete "${name}" — it has ${cat.product_count} product(s). Move or delete them first.`);
      return;
    }

    if (!confirm(`Delete category "${name}"? This cannot be undone.`)) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }
      setCategories((prev) => prev.filter((c) => c.id !== id));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
          <p className="mt-2 text-sm text-gray-500">
            Manage product categories. {categories.length} total.
          </p>
        </div>
        <button
          onClick={startAdd}
          className="flex items-center gap-2 rounded-md bg-nexifi-orange px-4 py-2 text-sm font-medium text-white hover:bg-nexifi-orange-dark"
        >
          <Plus className="size-4" />
          Add Category
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Add Form */}
      {showAdd && (
        <div className="mt-4 rounded-lg border bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-900">New Category</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <input
              type="text"
              placeholder="Category name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className="rounded-md border px-3 py-2 text-sm focus:border-nexifi-orange focus:outline-none focus:ring-1 focus:ring-nexifi-orange"
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="rounded-md border px-3 py-2 text-sm focus:border-nexifi-orange focus:outline-none focus:ring-1 focus:ring-nexifi-orange"
            />
            <input
              type="number"
              placeholder="Sort order"
              value={formSortOrder}
              onChange={(e) => setFormSortOrder(Number(e.target.value))}
              className="rounded-md border px-3 py-2 text-sm focus:border-nexifi-orange focus:outline-none focus:ring-1 focus:ring-nexifi-orange"
            />
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-1 rounded-md bg-nexifi-orange px-4 py-2 text-sm font-medium text-white hover:bg-nexifi-orange-dark disabled:opacity-50"
            >
              {loading && <Loader2 className="size-3 animate-spin" />}
              Create
            </button>
            <button
              onClick={resetForm}
              className="rounded-md border px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Category List */}
      <div className="mt-6 divide-y rounded-lg bg-white shadow">
        {categories.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-400">
            No categories yet. Add your first category above.
          </div>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="px-6 py-4">
              {editingId === cat.id ? (
                /* Inline Edit */
                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="rounded-md border px-3 py-2 text-sm focus:border-nexifi-orange focus:outline-none focus:ring-1 focus:ring-nexifi-orange"
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="rounded-md border px-3 py-2 text-sm focus:border-nexifi-orange focus:outline-none focus:ring-1 focus:ring-nexifi-orange"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={formSortOrder}
                        onChange={(e) => setFormSortOrder(Number(e.target.value))}
                        className="w-20 rounded-md border px-3 py-2 text-sm focus:border-nexifi-orange focus:outline-none focus:ring-1 focus:ring-nexifi-orange"
                      />
                      <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-1 rounded-md bg-nexifi-orange px-3 py-2 text-sm font-medium text-white hover:bg-nexifi-orange-dark disabled:opacity-50"
                      >
                        {loading && <Loader2 className="size-3 animate-spin" />}
                        Save
                      </button>
                      <button
                        onClick={resetForm}
                        className="rounded-md border p-2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                  </div>

                  {/* Product Assignment Section */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowProducts(!showProducts)}
                      className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-nexifi-orange"
                    >
                      {showProducts ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                      Assign Products ({selectedProductIds.length} selected)
                    </button>

                    {showProducts && (
                      <div className="mt-2 max-h-60 overflow-y-auto rounded-md border p-3">
                        {products.length === 0 ? (
                          <p className="text-xs text-gray-400">No products available.</p>
                        ) : (
                          <div className="space-y-1.5">
                            {products.map((product) => {
                              const isSelected = selectedProductIds.includes(product.id);
                              const otherCategory =
                                product.category_id &&
                                product.category_id !== cat.id
                                  ? getCategoryName(product.category_id)
                                  : null;

                              return (
                                <label
                                  key={product.id}
                                  className={`flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm transition-colors ${
                                    isSelected
                                      ? "bg-orange-50 text-gray-900"
                                      : "text-gray-600 hover:bg-gray-50"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleProduct(product.id)}
                                    className="rounded accent-nexifi-orange"
                                  />
                                  <span className="flex-1">{product.name}</span>
                                  {otherCategory && (
                                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
                                      in {otherCategory}
                                    </span>
                                  )}
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Display Row */
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEdit(cat)}
                        className="text-sm font-medium text-gray-900 hover:text-nexifi-orange hover:underline"
                      >
                        {cat.name}
                      </button>
                      {!cat.is_active && (
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {cat.product_count} product{cat.product_count !== 1 ? "s" : ""}
                      {cat.description ? ` · ${cat.description}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(cat)}
                      className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      title="Edit"
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
