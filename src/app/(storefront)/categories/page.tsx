import React from "react";
import type { Metadata } from "next";
import CategoryGrid from "@/components/storefront/CategoryGrid";
import { getCategories } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "All Categories | NEXIFI",
  description:
    "Browse all product categories at NEXIFI — electronics, gadgets, toys, and home appliances at wholesale prices.",
  openGraph: {
    title: "All Categories — NEXIFI",
    description:
      "Browse all product categories at NEXIFI — electronics, gadgets, toys, and home appliances at wholesale prices.",
    url: "/categories",
  },
};

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="animate-fade-in mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">
        All Categories
      </h1>
      <div className="mt-1.5 h-1 w-12 rounded-full bg-nexifi-orange md:w-16" />
      <p className="mt-3 text-sm text-muted-foreground">
        {categories.length} {categories.length === 1 ? "category" : "categories"} available
      </p>

      <div className="mt-6 md:mt-8">
        <CategoryGrid categories={categories} />
      </div>
    </div>
  );
}
