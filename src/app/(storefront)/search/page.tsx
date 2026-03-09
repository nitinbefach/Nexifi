import React from "react";
import { Search } from "lucide-react";
import ProductGrid from "@/components/storefront/ProductGrid";
import { searchProducts, toCardProduct } from "@/lib/supabase/queries";

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;

  const results = q ? await searchProducts(q) : [];
  const products = results.map(toCardProduct);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <h1 className="text-2xl font-bold sm:text-3xl">Search Results</h1>
      {q ? (
        <p className="mt-1 text-sm text-muted-foreground">
          {products.length} {products.length === 1 ? "result" : "results"} for &ldquo;{q}&rdquo;
        </p>
      ) : (
        <p className="mt-1 text-sm text-muted-foreground">
          Enter a search term to find products
        </p>
      )}

      {q && products.length > 0 && (
        <div className="mt-6">
          <ProductGrid products={products} />
        </div>
      )}

      {q && products.length === 0 && (
        <div className="mt-16 text-center">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-muted">
            <Search className="size-8 text-muted-foreground" />
          </div>
          <p className="mt-4 font-medium">No products found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a different search term or browse our categories
          </p>
        </div>
      )}

      {!q && (
        <div className="mt-16 text-center">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-muted">
            <Search className="size-8 text-muted-foreground" />
          </div>
          <p className="mt-4 text-muted-foreground">
            Try searching for products, categories, or brands
          </p>
        </div>
      )}
    </div>
  );
}
