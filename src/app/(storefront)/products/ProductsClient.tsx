"use client";

import React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import ProductGrid from "@/components/storefront/ProductGrid";
import type { Product } from "@/components/storefront/ProductCard";
import type { Category } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useUIStore } from "@/stores/ui-store";

interface ProductsClientProps {
  products: Product[];
  categories: Category[];
  total: number;
  page: number;
  totalPages: number;
  currentSort?: string;
  currentCategory?: string;
  searchQuery?: string;
}

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Best Rating" },
  { value: "best-selling", label: "Best Selling" },
];

export default function ProductsClient({
  products,
  categories,
  total,
  page,
  totalPages,
  currentSort = "newest",
  currentCategory,
  searchQuery,
}: ProductsClientProps) {
  const router = useRouter();
  const searchParamsHook = useSearchParams();
  const { isFilterOpen, isSortOpen, closeFilter, closeSort } = useUIStore();

  const buildUrl = (overrides: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParamsHook.toString());
    Object.entries(overrides).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    // Reset to page 1 when changing filters
    if (!overrides.page) params.delete("page");
    return `/products?${params.toString()}`;
  };

  const handleSortChange = (value: string) => {
    router.push(buildUrl({ sort: value }));
  };

  const handleCategoryClick = (slug: string | undefined) => {
    router.push(buildUrl({ category: slug }));
    closeFilter();
  };

  return (
    <div className="animate-fade-in mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">
          {searchQuery ? `Results for "${searchQuery}"` : "All Products"}
        </h1>
        <div className="mt-1.5 h-1 w-12 rounded-full bg-nexifi-orange md:w-16" />
        <p className="mt-2 text-sm text-muted-foreground">
          {total} {total === 1 ? "product" : "products"} found
        </p>
      </div>

      <div className="mt-6 flex gap-8">
        {/* Desktop Filters */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-24 space-y-6 rounded-2xl border bg-card p-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">Filters</h2>
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</h3>
              <ul className="mt-3 space-y-1">
                <li>
                  <button
                    onClick={() => handleCategoryClick(undefined)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      !currentCategory
                        ? "bg-nexifi-orange/10 font-semibold text-nexifi-orange"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    All Categories
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => handleCategoryClick(cat.slug)}
                      className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        currentCategory === cat.slug
                          ? "bg-nexifi-orange/10 font-semibold text-nexifi-orange"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="mb-5 flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg lg:hidden"
              onClick={() => useUIStore.getState().toggleFilter()}
            >
              <SlidersHorizontal className="size-4" />
              Filters
            </Button>

            <span className="hidden text-sm text-muted-foreground sm:block">
              Showing {products.length} of {total} products
            </span>

            <select
              value={currentSort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="h-9 cursor-pointer rounded-lg border bg-background px-3 text-sm transition-colors hover:border-nexifi-orange/40 focus:outline-none focus:ring-2 focus:ring-nexifi-orange/30"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <ProductGrid products={products} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-1.5 sm:gap-2">
              {page > 1 && (
                <Link
                  href={buildUrl({ page: String(page - 1) })}
                  className="flex size-10 items-center justify-center rounded-xl border transition-colors hover:bg-muted"
                >
                  <ChevronLeft className="size-4" />
                </Link>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={buildUrl({ page: String(p) })}
                  className={`flex size-10 items-center justify-center rounded-xl text-sm font-medium transition-all ${
                    p === page
                      ? "bg-nexifi-orange text-white shadow-sm"
                      : "border hover:bg-muted"
                  }`}
                >
                  {p}
                </Link>
              ))}
              {page < totalPages && (
                <Link
                  href={buildUrl({ page: String(page + 1) })}
                  className="flex size-10 items-center justify-center rounded-xl border transition-colors hover:bg-muted"
                >
                  <ChevronRight className="size-4" />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Sheet */}
      <Sheet open={isFilterOpen} onOpenChange={(open) => !open && closeFilter()}>
        <SheetContent side="bottom" className="rounded-t-2xl p-0">
          <SheetHeader className="border-b px-5 py-4">
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</h3>
            <ul className="mt-3 space-y-1">
              <li>
                <button
                  onClick={() => handleCategoryClick(undefined)}
                  className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                    !currentCategory
                      ? "bg-nexifi-orange/10 font-semibold text-nexifi-orange"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  All Categories
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => handleCategoryClick(cat.slug)}
                    className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                      currentCategory === cat.slug
                        ? "bg-nexifi-orange/10 font-semibold text-nexifi-orange"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </SheetContent>
      </Sheet>

      {/* Mobile Sort Sheet */}
      <Sheet open={isSortOpen} onOpenChange={(open) => !open && closeSort()}>
        <SheetContent side="bottom" className="rounded-t-2xl p-0">
          <SheetHeader className="border-b px-5 py-4">
            <SheetTitle>Sort By</SheetTitle>
          </SheetHeader>
          <div className="p-2">
            {sortOptions.map((opt) => (
              <button
                key={opt.value}
                className={`flex w-full items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  currentSort === opt.value
                    ? "bg-nexifi-orange/10 text-nexifi-orange"
                    : "text-foreground hover:bg-muted"
                }`}
                onClick={() => {
                  handleSortChange(opt.value);
                  closeSort();
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
