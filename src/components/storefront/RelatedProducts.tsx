import React from "react";
import ProductGrid from "@/components/storefront/ProductGrid";
import type { Product } from "@/components/storefront/ProductCard";

interface RelatedProductsProps {
  products: Product[];
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <section className="mt-10 sm:mt-14">
      <h2 className="text-lg font-semibold sm:text-xl md:text-2xl lg:text-3xl">
        You May Also Like
      </h2>
      <div className="mt-4 md:mt-6">
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
