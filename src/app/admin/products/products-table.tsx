"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Trash2,
  Archive,
  ArchiveRestore,
  Pencil,
  FolderInput,
  X,
} from "lucide-react";
import { formatINR } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import LinkButton from "@/components/admin/LinkButton";

/* ---------- types ---------- */
interface ProductImage {
  id: string;
  image_url: string;
  is_primary: boolean;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  selling_price: number;
  original_price: number;
  stock_quantity: number;
  is_active: boolean;
  category: { id: string; name: string } | null;
  images: ProductImage[];
}

interface Category {
  id: string;
  name: string;
}

interface ProductsTableProps {
  products: Product[];
  categories: Category[];
  page: number;
  totalPages: number;
  total: number;
  search: string;
  filterStatus?: "active" | "archived";
  filterCategory?: string;
  filterStock?: "low";
}

/* ---------- helpers ---------- */
function buildHref(
  params: Record<string, string | undefined>,
  overrides: Record<string, string | undefined>
) {
  const merged = { ...params, ...overrides, page: undefined };
  const qs = Object.entries(merged)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
    .join("&");
  return `/admin/products${qs ? `?${qs}` : ""}`;
}

function paginationHref(
  params: Record<string, string | undefined>,
  targetPage: number
) {
  const merged = { ...params, page: String(targetPage) };
  const qs = Object.entries(merged)
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
    .join("&");
  return `/admin/products${qs ? `?${qs}` : ""}`;
}

/* ---------- component ---------- */
export default function ProductsTable({
  products: initialProducts,
  categories,
  page,
  totalPages,
  total,
  search,
  filterStatus,
  filterCategory,
  filterStock,
}: ProductsTableProps) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [bulkConfirmDelete, setBulkConfirmDelete] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (!tableRef.current?.contains(target)) {
        setOpenMenu(null);
        setShowCategoryPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Current filter params (for building URLs)
  const currentParams: Record<string, string | undefined> = {
    search: search || undefined,
    status: filterStatus,
    category: filterCategory,
    stock: filterStock,
  };

  /* Selection helpers */
  const allSelected =
    products.length > 0 && products.every((p) => selected.has(p.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(products.map((p) => p.id)));
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /* Single product actions */
  const handleDelete = useCallback(async (id: string) => {
    setLoading(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setSelected((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    } finally {
      setLoading(null);
      setConfirmDelete(null);
    }
  }, []);

  const handleToggleActive = useCallback(async (id: string, currentActive: boolean) => {
    setLoading(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentActive }),
      });
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p.id === id ? { ...p, is_active: !currentActive } : p))
        );
      }
    } finally {
      setLoading(null);
      setOpenMenu(null);
    }
  }, []);

  /* Bulk actions */
  const bulkAction = useCallback(
    async (
      action: "archive" | "unarchive" | "delete" | "change-category",
      category_id?: string
    ) => {
      const ids = Array.from(selected);
      if (ids.length === 0) return;
      setLoading("bulk");
      try {
        const res = await fetch("/api/admin/products/bulk", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids, action, category_id }),
        });
        if (res.ok) {
          if (action === "delete") {
            setProducts((prev) => prev.filter((p) => !selected.has(p.id)));
          } else if (action === "archive") {
            setProducts((prev) =>
              prev.map((p) => (selected.has(p.id) ? { ...p, is_active: false } : p))
            );
          } else if (action === "unarchive") {
            setProducts((prev) =>
              prev.map((p) => (selected.has(p.id) ? { ...p, is_active: true } : p))
            );
          } else if (action === "change-category" && category_id) {
            const cat = categories.find((c) => c.id === category_id) || null;
            setProducts((prev) =>
              prev.map((p) =>
                selected.has(p.id)
                  ? { ...p, category: cat ? { id: cat.id, name: cat.name } : null }
                  : p
              )
            );
          }
          setSelected(new Set());
        }
      } finally {
        setLoading(null);
        setBulkConfirmDelete(false);
        setShowCategoryPicker(false);
      }
    },
    [selected, categories]
  );

  const isBusy = loading !== null;

  /* Pill style helper */
  const pill = (active: boolean) =>
    active
      ? "rounded-full bg-nexifi-orange px-3 py-1 text-xs font-medium text-white"
      : "rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-muted";

  return (
    <div ref={tableRef} className="space-y-4">
      {/* Search */}
      <form method="GET">
        {filterStatus && <input type="hidden" name="status" value={filterStatus} />}
        {filterCategory && <input type="hidden" name="category" value={filterCategory} />}
        {filterStock && <input type="hidden" name="stock" value={filterStock} />}
        <Input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Search products..."
          className="max-w-sm"
        />
      </form>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-1.5">
          <span className="mr-1 text-xs font-medium text-muted-foreground">Status:</span>
          <Link href={buildHref(currentParams, { status: undefined })} className={pill(!filterStatus)}>All</Link>
          <Link href={buildHref(currentParams, { status: "active" })} className={pill(filterStatus === "active")}>Active</Link>
          <Link href={buildHref(currentParams, { status: "archived" })} className={pill(filterStatus === "archived")}>Archived</Link>
        </div>

        <div className="h-5 w-px bg-border" />

        <div className="flex items-center gap-1.5">
          <span className="mr-1 text-xs font-medium text-muted-foreground">Stock:</span>
          <Link href={buildHref(currentParams, { stock: undefined })} className={pill(!filterStock)}>All</Link>
          <Link href={buildHref(currentParams, { stock: "low" })} className={pill(filterStock === "low")}>Low Stock</Link>
        </div>

        <div className="h-5 w-px bg-border" />

        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">Category:</span>
          <select
            value={filterCategory || ""}
            onChange={(e) => router.push(buildHref(currentParams, { category: e.target.value || undefined }))}
            className="rounded-md border bg-background px-2 py-1 text-xs focus:border-nexifi-orange focus:outline-none focus:ring-1 focus:ring-nexifi-orange"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-nexifi-orange/30 bg-nexifi-orange/5 px-4 py-3">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <div className="h-5 w-px bg-border" />

          <button disabled={isBusy} onClick={() => bulkAction("archive")}
            className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50">
            <Archive className="size-3.5" /> Archive
          </button>
          <button disabled={isBusy} onClick={() => bulkAction("unarchive")}
            className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50">
            <ArchiveRestore className="size-3.5" /> Unarchive
          </button>

          <div className="relative">
            <button disabled={isBusy} onClick={() => setShowCategoryPicker((v) => !v)}
              className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50">
              <FolderInput className="size-3.5" /> Change Category
            </button>
            {showCategoryPicker && (
              <div className="absolute left-0 top-full z-50 mt-1 min-w-[200px] rounded-lg border bg-popover py-1 shadow-lg">
                {categories.map((cat) => (
                  <button key={cat.id} onClick={() => bulkAction("change-category", cat.id)}
                    className="block w-full px-4 py-2 text-left text-sm hover:bg-muted">{cat.name}</button>
                ))}
                {categories.length === 0 && <p className="px-4 py-2 text-xs text-muted-foreground">No categories</p>}
              </div>
            )}
          </div>

          {!bulkConfirmDelete ? (
            <button disabled={isBusy} onClick={() => setBulkConfirmDelete(true)}
              className="flex items-center gap-1.5 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/20 disabled:opacity-50">
              <Trash2 className="size-3.5" /> Delete
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-destructive">Delete {selected.size} product{selected.size > 1 ? "s" : ""}?</span>
              <button disabled={isBusy} onClick={() => bulkAction("delete")}
                className="rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50">
                {loading === "bulk" ? "Deleting…" : "Confirm"}
              </button>
              <button onClick={() => setBulkConfirmDelete(false)} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
            </div>
          )}

          <div className="ml-auto">
            <button onClick={() => setSelected(new Set())} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              <X className="size-3.5" /> Clear
            </button>
          </div>
        </div>
      )}

      {/* Product Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="size-4 rounded border-gray-300 accent-nexifi-orange"
                  />
                </TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    {search || filterStatus || filterCategory || filterStock
                      ? "No products match your filters."
                      : "No products yet."}
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => {
                  const primaryImage = product.images?.find((img) => img.is_primary);
                  const isChecked = selected.has(product.id);
                  const rowBusy = loading === product.id;
                  const stockLevel =
                    product.stock_quantity < 5 ? "low"
                      : product.stock_quantity < 15 ? "medium"
                        : "good";

                  return (
                    <TableRow
                      key={product.id}
                      className={`admin-table-row ${isChecked ? "bg-nexifi-orange/5" : ""} ${rowBusy ? "opacity-60" : ""}`}
                    >
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleOne(product.id)}
                          className="size-4 rounded border-gray-300 accent-nexifi-orange"
                        />
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-3">
                          {primaryImage ? (
                            <div className="img-hover-zoom rounded-md">
                              <img src={primaryImage.image_url} alt={product.name} className="size-10 rounded-md object-cover" />
                            </div>
                          ) : (
                            <div className="flex size-10 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">IMG</div>
                          )}
                          <div>
                            <Link href={`/admin/products/${product.id}/edit`} className="font-medium hover:text-nexifi-orange hover:underline">
                              {product.name}
                            </Link>
                            <p className="text-xs text-muted-foreground">{product.sku || "—"}</p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-muted-foreground">{product.category?.name || "—"}</TableCell>

                      <TableCell>
                        <span className="font-medium">{formatINR(product.selling_price)}</span>
                        {product.original_price > product.selling_price && (
                          <span className="ml-1.5 text-xs text-muted-foreground line-through">{formatINR(product.original_price)}</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <span className={
                          stockLevel === "low" ? "font-semibold text-destructive"
                            : stockLevel === "medium" ? "font-medium text-amber-500"
                              : "text-muted-foreground"
                        }>
                          {product.stock_quantity}
                        </span>
                      </TableCell>

                      <TableCell>
                        <Badge variant={product.is_active ? "default" : "secondary"}>
                          {product.is_active ? "Active" : "Archived"}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          {confirmDelete === product.id ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-destructive">Delete?</span>
                              <button disabled={rowBusy} onClick={() => handleDelete(product.id)}
                                className="rounded bg-destructive px-2 py-1 text-xs text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50">
                                {rowBusy ? "…" : "Yes"}
                              </button>
                              <button onClick={() => setConfirmDelete(null)} className="text-xs text-muted-foreground hover:text-foreground">No</button>
                            </div>
                          ) : (
                            <div className="relative">
                              <button
                                onClick={() => setOpenMenu(openMenu === product.id ? null : product.id)}
                                className="rounded p-1.5 hover:bg-muted"
                                aria-label="Product actions"
                              >
                                <MoreHorizontal className="size-4 text-muted-foreground" />
                              </button>

                              {openMenu === product.id && (
                                <div className="absolute right-0 top-full z-50 mt-1 min-w-[160px] rounded-lg border bg-popover py-1 shadow-lg">
                                  <Link href={`/admin/products/${product.id}/edit`} onClick={() => setOpenMenu(null)}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted">
                                    <Pencil className="size-3.5" /> Edit
                                  </Link>
                                  <button disabled={rowBusy} onClick={() => handleToggleActive(product.id, product.is_active)}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted disabled:opacity-50">
                                    {product.is_active
                                      ? <><Archive className="size-3.5" /> Archive</>
                                      : <><ArchiveRestore className="size-3.5" /> Unarchive</>}
                                  </button>
                                  <button onClick={() => { setOpenMenu(null); setConfirmDelete(product.id); }}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10">
                                    <Trash2 className="size-3.5" /> Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                {page > 1 && (
                  <LinkButton href={paginationHref(currentParams, page - 1)} size="xs">Previous</LinkButton>
                )}
                {page < totalPages && (
                  <LinkButton href={paginationHref(currentParams, page + 1)} size="xs">Next</LinkButton>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
