"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import StarRating from "./StarRating";

export interface Product {
  id: string;
  name: string;
  slug: string;
  image: string;
  originalPrice: number;
  sellingPrice: number;
  avgRating: number;
  reviewCount: number;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const discount =
    product.originalPrice > product.sellingPrice
      ? Math.round(
          ((product.originalPrice - product.sellingPrice) / product.originalPrice) * 100
        )
      : 0;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-all duration-200 hover:-translate-y-1 hover:border-nexifi-orange/40 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nexifi-orange"
    >
      {/* Image Area */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <span className="text-xs text-muted-foreground">No image</span>
          </div>
        )}

        {/* Discount Badge */}
        {discount > 0 && (
          <span className="absolute left-2 top-2 rounded-md bg-nexifi-orange px-1.5 py-0.5 text-[11px] font-bold text-white md:px-2 md:py-1 md:text-xs">
            {discount}% OFF
          </span>
        )}

      </div>

      {/* Info Area */}
      <div className="flex flex-1 flex-col gap-1 p-2.5 md:gap-1.5 md:p-4">
        <h3 className="line-clamp-2 text-xs font-medium leading-snug text-foreground sm:text-sm md:text-base">
          {product.name}
        </h3>

        {product.avgRating > 0 && (
          <StarRating rating={product.avgRating} count={product.reviewCount} size="sm" />
        )}

        <div className="mt-auto flex items-baseline gap-1 pt-0.5 md:gap-2 md:pt-1.5">
          <span className="text-sm font-bold text-foreground md:text-lg">
            Rs. {product.sellingPrice.toLocaleString("en-IN")}
          </span>
          {discount > 0 && (
            <span className="text-[11px] text-muted-foreground line-through md:text-sm">
              Rs. {product.originalPrice.toLocaleString("en-IN")}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
