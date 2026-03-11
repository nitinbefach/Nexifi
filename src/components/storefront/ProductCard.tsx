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
      className="card-hover group relative flex flex-col overflow-hidden rounded-2xl border bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nexifi-orange"
    >
      {/* Image Area */}
      <div className="relative aspect-square overflow-hidden bg-muted/50">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-400 group-hover:scale-108"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <span className="text-xs text-muted-foreground">No image</span>
          </div>
        )}

      </div>

      {/* Info Area */}
      <div className="flex flex-1 flex-col gap-1 p-3 md:gap-1.5 md:p-4">
        <h3 className="line-clamp-2 text-xs font-medium leading-snug text-foreground sm:text-sm md:text-[15px]">
          {product.name}
        </h3>

        {product.avgRating > 0 && (
          <StarRating rating={product.avgRating} count={product.reviewCount} size="sm" />
        )}

        <div className="mt-auto flex items-baseline gap-1.5 pt-1 md:gap-2 md:pt-2">
          <span className="text-sm font-bold text-foreground md:text-lg">
            ₹{product.sellingPrice.toLocaleString("en-IN")}
          </span>
          {discount > 0 && (
            <span className="text-[10px] text-muted-foreground line-through md:text-sm">
              ₹{product.originalPrice.toLocaleString("en-IN")}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
