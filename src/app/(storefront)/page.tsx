import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "NEXIFI — Next is Now | Wholesale Prices on Electronics & Gadgets",
  openGraph: {
    title: "NEXIFI — Next is Now",
    description:
      "Shop electronics, gadgets, toys, and home appliances at wholesale prices with fast delivery across India.",
    url: "/",
  },
};
import HeroBanner from "@/components/storefront/HeroBanner";
import CategoryGrid from "@/components/storefront/CategoryGrid";
import ProductGrid from "@/components/storefront/ProductGrid";
import {
  getCategories,
  getProducts,
  getBanners,
  toCardProduct,
} from "@/lib/supabase/queries";

function SectionHeader({
  title,
  href,
  linkText = "View All",
}: {
  title: string;
  href: string;
  linkText?: string;
}) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <h2 className="text-xl font-bold text-foreground sm:text-2xl md:text-3xl">
          {title}
        </h2>
        <div className="mt-1.5 h-1 w-12 rounded-full bg-nexifi-orange md:w-16" />
      </div>
      <Link
        href={href}
        className="flex items-center gap-1 text-sm font-semibold text-nexifi-orange transition-colors hover:text-nexifi-orange-dark md:text-base"
      >
        {linkText} <ArrowRight className="size-4 md:size-5" />
      </Link>
    </div>
  );
}

export default async function HomePage() {
  const [banners, categories, bestSelling, trending] = await Promise.all([
    getBanners(),
    getCategories(),
    getProducts({ sort: "best-selling", limit: 8 }),
    getProducts({ sort: "newest", limit: 8 }),
  ]);

  return (
    <div className="animate-fade-in">
      {/* Hero Banner */}
      <HeroBanner banners={banners} />

      {/* Browse Categories */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 md:py-16 lg:px-8">
        <SectionHeader title="Browse Categories" href="/products" />
        <div className="mt-5 md:mt-8">
          <CategoryGrid categories={categories} />
        </div>
      </section>

      {/* Best Selling */}
      <section className="bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 md:py-16 lg:px-8">
          <SectionHeader
            title="Best Selling"
            href="/products?sort=best-selling"
          />
          <div className="mt-5 md:mt-8">
            <ProductGrid
              products={bestSelling.products.map(toCardProduct)}
            />
          </div>
        </div>
      </section>

      {/* Trending Now */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 md:py-16 lg:px-8">
        <SectionHeader title="Trending Now" href="/products?sort=newest" />
        <div className="mt-5 md:mt-8">
          <ProductGrid products={trending.products.map(toCardProduct)} />
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="nexifi-gradient">
        <div className="mx-auto max-w-7xl px-4 py-10 text-center text-white sm:px-6 sm:py-14 md:py-16 lg:px-8 lg:py-20">
          <h2 className="text-xl font-bold sm:text-2xl md:text-3xl">
            Get 10% Off Your First Order
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/80 md:mt-3 md:text-base">
            Subscribe to our newsletter for exclusive deals and new arrivals
          </p>
          <div className="mx-auto mt-5 flex max-w-sm gap-2 sm:max-w-md md:mt-7 md:max-w-lg">
            <input
              type="email"
              placeholder="Enter your email"
              className="h-10 flex-1 rounded-full bg-white/20 px-4 text-sm text-white placeholder:text-white/60 outline-none backdrop-blur-sm focus:bg-white/30 focus:ring-2 focus:ring-white/50 md:h-12 md:px-5 md:text-base"
            />
            <button
              type="button"
              className="shrink-0 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-gray-900 transition-transform hover:scale-105 active:scale-95 md:px-7 md:py-3 md:text-base"
            >
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
