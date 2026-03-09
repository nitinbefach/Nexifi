import React from "react";
import Link from "next/link";
import { ArrowRight, Truck, Shield, Headphones, RotateCcw } from "lucide-react";
import HeroBanner from "@/components/storefront/HeroBanner";
import CategoryGrid from "@/components/storefront/CategoryGrid";
import ProductGrid from "@/components/storefront/ProductGrid";
import {
  getCategories,
  getProducts,
  getBanners,
  toCardProduct,
} from "@/lib/supabase/queries";

const trustBadges = [
  { icon: Truck, label: "Free Shipping", desc: "Orders above Rs. 999" },
  { icon: Shield, label: "Secure Payment", desc: "100% protected" },
  { icon: Headphones, label: "24/7 Support", desc: "Always here to help" },
  { icon: RotateCcw, label: "Easy Returns", desc: "7-day return policy" },
];

export default async function HomePage() {
  const [banners, categories, bestSelling, trending] = await Promise.all([
    getBanners(),
    getCategories(),
    getProducts({ sort: "best-selling", limit: 4 }),
    getProducts({ sort: "newest", limit: 4 }),
  ]);

  return (
    <div>
      {/* Hero Banner */}
      <HeroBanner banners={banners} />

      {/* Trust Badges */}
      <section className="border-b bg-muted/30">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-3 py-3 sm:flex sm:justify-center sm:gap-8 sm:px-6 md:gap-10 md:py-6 lg:gap-14 lg:px-8 lg:py-7">
          {trustBadges.map((badge) => (
            <div
              key={badge.label}
              className="flex flex-col items-center gap-1 sm:flex-row sm:gap-4"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-nexifi-orange/10 md:size-12 lg:size-14">
                <badge.icon className="size-4 text-nexifi-orange md:size-6 lg:size-7" />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-[10px] font-medium sm:text-sm md:text-base">{badge.label}</p>
                <p className="hidden text-muted-foreground sm:block sm:text-xs md:text-sm">{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Browse Categories */}
      <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-12 md:py-16 lg:px-8 lg:py-20">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold sm:text-2xl md:text-3xl lg:text-4xl">Browse Categories</h2>
          <Link
            href="/products"
            className="flex items-center gap-1 text-sm font-semibold text-nexifi-orange hover:underline md:text-base"
          >
            View All <ArrowRight className="size-4 md:size-5" />
          </Link>
        </div>
        <div className="mt-4 md:mt-7">
          <CategoryGrid categories={categories} />
        </div>
      </section>

      {/* Best Selling */}
      <section className="bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-12 md:py-16 lg:px-8 lg:py-20">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold sm:text-2xl md:text-3xl lg:text-4xl">Best Selling</h2>
            <Link
              href="/products?sort=best-selling"
              className="flex items-center gap-1 text-sm font-semibold text-nexifi-orange hover:underline md:text-base"
            >
              View All <ArrowRight className="size-4 md:size-5" />
            </Link>
          </div>
          <div className="mt-4 md:mt-7">
            <ProductGrid products={bestSelling.products.map(toCardProduct)} />
          </div>
        </div>
      </section>

      {/* Trending Now */}
      <section className="mx-auto max-w-7xl px-4 py-7 sm:px-6 sm:py-12 md:py-16 lg:px-8 lg:py-20">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold sm:text-2xl md:text-3xl lg:text-4xl">Trending Now</h2>
          <Link
            href="/products?sort=newest"
            className="flex items-center gap-1 text-sm font-semibold text-nexifi-orange hover:underline md:text-base"
          >
            View All <ArrowRight className="size-4 md:size-5" />
          </Link>
        </div>
        <div className="mt-4 md:mt-7">
          <ProductGrid products={trending.products.map(toCardProduct)} />
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="nexifi-gradient">
        <div className="mx-auto max-w-7xl px-4 py-8 text-center text-white sm:px-6 sm:py-14 md:py-16 lg:px-8 lg:py-20">
          <h2 className="text-lg font-semibold sm:text-2xl md:text-3xl lg:text-4xl">Get 10% Off Your First Order</h2>
          <p className="mt-2 text-sm text-white/80 md:mt-3 md:text-base lg:text-lg">
            Subscribe to our newsletter for exclusive deals and new arrivals
          </p>
          <div className="mx-auto mt-4 flex max-w-sm gap-2 sm:max-w-md md:mt-7 md:max-w-lg">
            <input
              type="email"
              placeholder="Enter your email"
              className="h-9 flex-1 rounded-full bg-white/20 px-3.5 text-xs text-white sm:text-sm placeholder:text-white/60 outline-none backdrop-blur-sm focus:bg-white/30 focus:ring-2 focus:ring-white/50 md:h-12 md:px-5 md:text-base"
            />
            <button
              type="button"
              className="shrink-0 rounded-full bg-white px-4 py-2 text-xs font-semibold text-gray-900 sm:text-sm transition-transform hover:scale-105 md:px-7 md:py-3 md:text-base"
            >
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
