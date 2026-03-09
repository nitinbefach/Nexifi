import React from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductGrid from "@/components/storefront/ProductGrid";
import { getProducts, getCategories, toCardProduct } from "@/lib/supabase/queries";
import ProductsClient from "./ProductsClient";

interface ProductsPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
    min?: string;
    max?: string;
    page?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const sort = params.sort || "newest";

  const [result, categories] = await Promise.all([
    getProducts({
      search: params.q,
      categorySlug: params.category,
      sort,
      minPrice: params.min ? Number(params.min) : undefined,
      maxPrice: params.max ? Number(params.max) : undefined,
      page,
      limit: 12,
    }),
    getCategories(),
  ]);

  const products = result.products.map(toCardProduct);

  return (
    <ProductsClient
      products={products}
      categories={categories}
      total={result.total}
      page={result.page}
      totalPages={result.totalPages}
      currentSort={sort}
      currentCategory={params.category}
      searchQuery={params.q}
    />
  );
}
