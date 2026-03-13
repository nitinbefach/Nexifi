"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2, Loader2, Archive, ArchiveRestore, FolderSync } from "lucide-react";
import { formatINR } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import LinkButton from "@/components/admin/LinkButton";

interface ProductRow {
  id: string;
  name: string;
  sku: string | null;
  selling_price: number;
  original_price: number;
  stock_quantity: number;
  is_active: boolean;
  category: { name: string } | null;
  images: { image_url: string; is_primary: boolean }[] | null;
}

interface CategoryOption {
  id: string;
  name: string;
}

interface Props {
  products: ProductRow[];
  page: number;
  totalPages: number;
  search: string;
  categories: { categories: CategoryOption[] };
}

type BulkAction = "delete" | "archive" | "unarchive" | "category" | null;

export default function ProductsTableClient({ products, page, totalPages, search, categories }: Props) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<BulkAction>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const allSelected = products.length > 0 && selectedIds.size === products.length;
  const isBusy = bulkAction !== null;

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map((p) => p.id)));
    }
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const bulkUpdate = async (data: Record<string, unknown>, actionName: string) => {
    const ids = Array.from(selectedIds);
    let failed = 0;

    for (const id of ids) {
      try {
        const res = await fetch(`/api/admin/products/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        if (!res.ok) failed++;
      } catch {
        failed++;
      }
    }

    setSelectedIds(new Set());

    if (failed > 0) {
      alert(`${ids.length - failed} ${actionName}, ${failed} failed.`);
    }

    router.refresh();
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} product${selectedIds.size > 1 ? "s" : ""}? This cannot be undone.`)) return;

    setBulkAction("delete");
    const ids = Array.from(selectedIds);
    let failed = 0;

    for (const id of ids) {
      try {
        const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
        if (!res.ok) failed++;
      } catch {
        failed++;
      }
    }

    setSelectedIds(new Set());
    setBulkAction(null);

    if (failed > 0) {
      alert(`${ids.length - failed} deleted, ${failed} failed.`);
    }

    router.refresh();
  };

  const handleArchiveSelected = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Archive ${selectedIds.size} product${selectedIds.size > 1 ? "s" : ""}? They will be hidden from the store.`)) return;

    setBulkAction("archive");
    await bulkUpdate({ is_active: false }, "archived");
    setBulkAction(null);
  };

  const handleUnarchiveSelected = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Unarchive ${selectedIds.size} product${selectedIds.size > 1 ? "s" : ""}? They will be visible on the store.`)) return;

    setBulkAction("unarchive");
    await bulkUpdate({ is_active: true }, "unarchived");
    setBulkAction(null);
  };

  const handleCategoryChange = async (categoryId: string) => {
    if (selectedIds.size === 0 || !categoryId) return;
    const catName = categories.categories.find((c) => c.id === categoryId)?.name || "selected category";
    if (!confirm(`Move ${selectedIds.size} product${selectedIds.size > 1 ? "s" : ""} to "${catName}"?`)) return;

    setBulkAction("category");
    await bulkUpdate({ category_id: categoryId }, "moved");
    setBulkAction(null);
  };

  const handleDeleteOne = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to delete product");
        return;
      }
      router.refresh();
    } catch {
      alert("Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      {/* Bulk Actions Toolbar */}
      {selectedIds.size > 0 && (
        <div className="flex flex-wrap items-center gap-2.5 rounded-lg border bg-muted/50 px-4 py-2.5">
          <span className="text-sm font-medium">
            {selectedIds.size} selected
          </span>

          <div className="h-5 w-px bg-border" />

          {/* Change Category */}
          <div className="relative">
            <select
              disabled={isBusy}
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) handleCategoryChange(e.target.value);
                e.target.value = "";
              }}
              className="h-8 appearance-none rounded-md border bg-background px-2.5 pr-7 text-sm font-medium disabled:opacity-50"
            >
              <option value="" disabled>
                Change Category
              </option>
              {categories.categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {bulkAction === "category" && (
              <Loader2 className="absolute right-2 top-2 size-4 animate-spin text-muted-foreground" />
            )}
            {bulkAction !== "category" && (
              <FolderSync className="pointer-events-none absolute right-2 top-2 size-4 text-muted-foreground" />
            )}
          </div>

          {/* Archive */}
          <button
            onClick={handleArchiveSelected}
            disabled={isBusy}
            className="flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent disabled:opacity-50"
          >
            {bulkAction === "archive" ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Archive className="size-3.5" />
            )}
            Archive
          </button>

          {/* Unarchive */}
          <button
            onClick={handleUnarchiveSelected}
            disabled={isBusy}
            className="flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-sm font-medium hover:bg-accent disabled:opacity-50"
          >
            {bulkAction === "unarchive" ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <ArchiveRestore className="size-3.5" />
            )}
            Unarchive
          </button>

          {/* Delete */}
          <button
            onClick={handleDeleteSelected}
            disabled={isBusy}
            className="flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {bulkAction === "delete" ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Trash2 className="size-3.5" />
            )}
            Delete
          </button>

          <div className="h-5 w-px bg-border" />

          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        </div>
      )}

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <Table className="min-w-[850px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="size-4 rounded accent-nexifi-orange"
                  />
                </TableHead>
                <TableHead className="min-w-[200px]">Product</TableHead>
                <TableHead className="whitespace-nowrap">Category</TableHead>
                <TableHead className="whitespace-nowrap">Price</TableHead>
                <TableHead className="whitespace-nowrap">Stock</TableHead>
                <TableHead className="whitespace-nowrap">Status</TableHead>
                <TableHead className="whitespace-nowrap">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    No products found.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => {
                  const primaryImage = product.images?.find((img) => img.is_primary);
                  const stockLevel =
                    product.stock_quantity < 5
                      ? "low"
                      : product.stock_quantity < 15
                        ? "medium"
                        : "good";

                  return (
                    <TableRow
                      key={product.id}
                      className={`admin-table-row ${selectedIds.has(product.id) ? "bg-muted/40" : ""}`}
                    >
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(product.id)}
                          onChange={() => toggleOne(product.id)}
                          className="size-4 rounded accent-nexifi-orange"
                        />
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="flex items-center gap-3">
                          {primaryImage ? (
                            <div className="img-hover-zoom shrink-0 rounded-md">
                              <img
                                src={primaryImage.image_url}
                                alt={product.name}
                                className="size-10 rounded-md object-cover"
                              />
                            </div>
                          ) : (
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                              IMG
                            </div>
                          )}
                          <div className="min-w-0">
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="block truncate font-medium hover:text-nexifi-orange hover:underline"
                              title={product.name}
                            >
                              {product.name}
                            </Link>
                            <p className="text-xs text-muted-foreground">
                              {product.sku || "—"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {product.category?.name || "—"}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">
                          {formatINR(product.selling_price)}
                        </span>
                        {product.original_price > product.selling_price && (
                          <span className="ml-1.5 text-xs text-muted-foreground line-through">
                            {formatINR(product.original_price)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span
                          className={
                            stockLevel === "low"
                              ? "font-semibold text-destructive"
                              : stockLevel === "medium"
                                ? "font-medium text-amber-500"
                                : "text-muted-foreground"
                          }
                        >
                          {product.stock_quantity}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.is_active ? "default" : "secondary"}>
                          {product.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="text-sm font-medium text-nexifi-orange hover:underline"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteOne(product.id, product.name)}
                            disabled={deletingId === product.id}
                            className="rounded p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                            title="Delete product"
                          >
                            {deletingId === product.id ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <Trash2 className="size-4" />
                            )}
                          </button>
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
              <p className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                {page > 1 && (
                  <LinkButton
                    href={`/admin/products?page=${page - 1}${search ? `&search=${search}` : ""}`}
                    size="xs"
                  >
                    Previous
                  </LinkButton>
                )}
                {page < totalPages && (
                  <LinkButton
                    href={`/admin/products?page=${page + 1}${search ? `&search=${search}` : ""}`}
                    size="xs"
                  >
                    Next
                  </LinkButton>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
