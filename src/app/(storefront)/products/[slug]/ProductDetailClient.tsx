"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Minus, Plus, Share2 } from "lucide-react";
import AddToCartButton from "@/components/storefront/AddToCartButton";
import BuyNowButton from "@/components/storefront/BuyNowButton";
import RelatedProducts from "@/components/storefront/RelatedProducts";
import type { Product } from "@/components/storefront/ProductCard";
import StarRating from "@/components/storefront/StarRating";
import { useProductPageStore } from "@/stores/product-page-store";
import { formatINR } from "@/lib/utils";
import type { ProductImage, ProductVariant, Category } from "@/types/product";

interface ProductData {
  id: string;
  name: string;
  description: string | null;
  originalPrice: number;
  sellingPrice: number;
  avgRating: number;
  reviewCount: number;
  stockQuantity: number;
  images: ProductImage[];
  variants: ProductVariant[];
  category: Category | null;
}

interface ProductDetailClientProps {
  slug: string;
  product: ProductData;
  relatedProducts?: Product[];
}

export default function ProductDetailClient({ slug, product, relatedProducts = [] }: ProductDetailClientProps) {
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"description" | "shipping">("description");

  const discount =
    product.originalPrice > product.sellingPrice
      ? Math.round(
          ((product.originalPrice - product.sellingPrice) / product.originalPrice) * 100
        )
      : 0;

  const primaryImage = product.images[selectedImageIndex] ?? product.images[0];

  // Populate product page store for mobile bottom bar
  useEffect(() => {
    useProductPageStore.getState().setProduct({
      productId: product.id,
      name: product.name,
      image: product.images[0]?.image_url ?? "",
      price: product.sellingPrice,
      originalPrice: product.originalPrice,
      variantId: selectedVariant || undefined,
    });
    return () => useProductPageStore.getState().clearProduct();
  }, [product, selectedVariant]);

  useEffect(() => {
    useProductPageStore.getState().setVariant(selectedVariant || undefined);
  }, [selectedVariant]);

  // Group variants by name (e.g., "Color" → ["Black", "Silver"])
  const variantGroups = product.variants.reduce<Record<string, ProductVariant[]>>(
    (acc, v) => {
      const group = acc[v.variant_name] ?? [];
      group.push(v);
      acc[v.variant_name] = group;
      return acc;
    },
    {}
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground sm:mb-6">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="size-3.5" />
        <Link href="/products" className="hover:text-foreground">Products</Link>
        <ChevronRight className="size-3.5" />
        {product.category && (
          <>
            <Link href={`/categories/${product.category.slug}`} className="hover:text-foreground">
              {product.category.name}
            </Link>
            <ChevronRight className="size-3.5" />
          </>
        )}
        <span className="text-foreground line-clamp-1">{product.name}</span>
      </nav>

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        {/* Image Gallery */}
        <div className="flex-1">
          <div className="aspect-square overflow-hidden rounded-2xl bg-muted">
            {primaryImage ? (
              <Image
                src={primaryImage.image_url}
                alt={primaryImage.alt_text || product.name}
                width={800}
                height={800}
                className="size-full object-cover"
                priority
              />
            ) : (
              <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
                No image available
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="mt-3 flex gap-2 sm:mt-4 sm:gap-3">
              {product.images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImageIndex(i)}
                  className={`size-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors sm:size-20 ${
                    i === selectedImageIndex
                      ? "border-nexifi-orange"
                      : "border-transparent hover:border-muted-foreground/30"
                  }`}
                >
                  <Image
                    src={img.image_url}
                    alt={img.alt_text || `${product.name} ${i + 1}`}
                    width={80}
                    height={80}
                    className="size-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold sm:text-3xl">{product.name}</h1>

          {product.avgRating > 0 && (
            <div className="mt-2 flex items-center gap-3">
              <StarRating rating={product.avgRating} count={product.reviewCount} size="md" />
            </div>
          )}

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-nexifi-orange sm:text-3xl">
              {formatINR(product.sellingPrice)}
            </span>
            {discount > 0 && (
              <>
                <span className="text-base text-muted-foreground line-through sm:text-lg">
                  {formatINR(product.originalPrice)}
                </span>
                <span className="rounded-md bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                  {discount}% off
                </span>
              </>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Inclusive of all taxes. Free shipping.</p>

          {/* Stock Status */}
          {product.stockQuantity <= 0 ? (
            <p className="mt-3 text-sm font-medium text-red-500">Out of Stock</p>
          ) : product.stockQuantity <= 5 ? (
            <p className="mt-3 text-sm font-medium text-amber-600">
              Only {product.stockQuantity} left in stock!
            </p>
          ) : null}

          {/* Variants */}
          {Object.entries(variantGroups).map(([groupName, variants]) => (
            <div key={groupName} className="mt-6">
              <h3 className="text-sm font-semibold">
                {groupName}:{" "}
                <span className="font-normal text-muted-foreground">
                  {variants.find((v) => v.id === selectedVariant)?.variant_value || "Select"}
                </span>
              </h3>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v.id === selectedVariant ? null : v.id)}
                    className={`flex h-11 min-w-[44px] items-center justify-center rounded-lg border-2 px-3 text-sm font-medium transition-all ${
                      selectedVariant === v.id
                        ? "border-nexifi-orange bg-nexifi-orange text-white"
                        : "border-border hover:border-nexifi-orange/50"
                    }`}
                  >
                    {v.variant_value}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Quantity */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold">Quantity</h3>
            <div className="mt-2.5 flex w-fit items-center rounded-lg border">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="flex size-10 items-center justify-center rounded-l-lg transition-colors hover:bg-muted"
                aria-label="Decrease quantity"
              >
                <Minus className="size-4" />
              </button>
              <span className="flex w-12 items-center justify-center text-sm font-medium">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(quantity + 1, 99))}
                className="flex size-10 items-center justify-center rounded-r-lg transition-colors hover:bg-muted"
                aria-label="Increase quantity"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>

          {/* Actions — hidden on mobile (bottom bar handles it) */}
          <div className="mt-8 hidden flex-col gap-3 sm:flex sm:flex-row">
            <AddToCartButton
              productId={product.id}
              name={product.name}
              image={product.images[0]?.image_url ?? ""}
              price={product.sellingPrice}
              originalPrice={product.originalPrice}
              variantId={selectedVariant || undefined}
              className="flex-1"
            />
            <BuyNowButton
              productId={product.id}
              name={product.name}
              image={product.images[0]?.image_url ?? ""}
              price={product.sellingPrice}
              originalPrice={product.originalPrice}
              variantId={selectedVariant || undefined}
              quantity={quantity}
              className="flex-1"
            />
            <button
              className="flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
              aria-label="Share product"
            >
              <Share2 className="size-4" />
              Share
            </button>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-8 rounded-xl bg-muted/30 p-4 sm:p-5">
              <h3 className="text-sm font-semibold">Description</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Section */}
      <section className="mt-12 sm:mt-16">
        <div className="flex gap-6 border-b sm:gap-8">
          {[
            { key: "description" as const, label: "Details" },
            { key: "shipping" as const, label: "Shipping & Returns" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "border-b-2 border-nexifi-orange text-nexifi-orange"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-6 sm:mt-8">
          {activeTab === "description" && (
            <div className="prose prose-sm max-w-none text-muted-foreground">
              <p>{product.description || "No additional details available."}</p>
            </div>
          )}

          {activeTab === "shipping" && (
            <div className="space-y-3 text-sm text-muted-foreground">
              <p><strong className="text-foreground">Free Shipping:</strong> On orders above Rs. 999</p>
              <p><strong className="text-foreground">Delivery Time:</strong> 3-7 business days across India</p>
              <p><strong className="text-foreground">Returns:</strong> 7-day easy return policy. Items must be unused and in original packaging.</p>
              <p><strong className="text-foreground">COD:</strong> Cash on Delivery available on orders under Rs. 5,000</p>
            </div>
          )}
        </div>
      </section>

      {/* Related Products */}
      <RelatedProducts products={relatedProducts} />
    </div>
  );
}
