import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import ProductGrid from "@/components/storefront/ProductGrid";
import SortSelect from "@/components/storefront/SortSelect";
import { getCategoryBySlug, getProducts, toCardProduct } from "@/lib/supabase/queries";
import type { Metadata } from "next";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category Not Found | NEXIFI" };
  const desc = category.description || `Browse ${category.name} products at NEXIFI — Next is Now`;
  return {
    title: `${category.name} | NEXIFI`,
    description: desc,
    openGraph: {
      title: `${category.name} — NEXIFI`,
      description: desc,
      url: `/categories/${slug}`,
      images: category.image_url ? [{ url: category.image_url }] : undefined,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { sort } = await searchParams;
  const category = await getCategoryBySlug(slug);

  if (!category) notFound();

  const result = await getProducts({ categorySlug: slug, sort: sort || "newest", limit: 24 });
  const products = result.products.map(toCardProduct);
  const currentSort = sort || "newest";

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground sm:mb-6">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="size-3.5" />
        <Link href="/products" className="hover:text-foreground">Products</Link>
        <ChevronRight className="size-3.5" />
        <span className="text-foreground">{category.name}</span>
      </nav>

      <h1 className="text-2xl font-bold sm:text-3xl lg:text-4xl">{category.name}</h1>
      {category.description && (
        <p className="mt-2 text-sm text-muted-foreground">{category.description}</p>
      )}

      <div className="mt-4 flex items-center justify-between sm:mt-6">
        <span className="text-sm text-muted-foreground">
          {result.total} {result.total === 1 ? "product" : "products"}
        </span>
        <SortSelect currentSort={currentSort} baseUrl={`/categories/${slug}`} />
      </div>

      <div className="mt-4 sm:mt-6">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
