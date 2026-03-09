"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import type { Banner } from "@/lib/supabase/queries";

const fallbackSlides = [
  {
    mobile: "/banners/banner-1.png",
    desktop: "/banners/banner-1-desktop.png",
    alt: "Premium Accessory Days — Uninterrupted Productivity, Immersive Entertainment",
    href: "/products",
  },
  {
    mobile: "/banners/banner-2.png",
    desktop: "/banners/banner-2-desktop.png",
    alt: "Dominate the Game, Immerse in Sound — Free Express Shipping + 20% Off",
    href: "/products",
  },
  {
    mobile: "/banners/banner-3.png",
    desktop: "/banners/banner-3-desktop.png",
    alt: "Dominate the Game — Save 30% on All Gaming Accessories",
    href: "/products",
  },
];

interface HeroBannerProps {
  banners?: Banner[];
}

export default function HeroBanner({ banners }: HeroBannerProps) {
  const slides =
    banners && banners.length > 0
      ? banners.map((b) => ({
          mobile: b.mobile_image_url || b.image_url,
          desktop: b.image_url,
          alt: b.title || "NEXIFI Banner",
          href: b.link_url || "/products",
        }))
      : fallbackSlides;

  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = slides[current];

  return (
    <section className="relative w-full overflow-hidden">
      <Link href={slide.href} className="group/banner block">
        <div className="relative h-[180px] bg-neutral-900 sm:h-[250px] md:h-[420px] lg:h-[460px] xl:h-[500px]">
          <picture>
            <source media="(min-width: 768px)" srcSet={slide.desktop} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.mobile}
              alt={slide.alt}
              className="size-full object-cover transition-all duration-700 group-hover/banner:brightness-[0.97]"
              loading={current === 0 ? "eager" : "lazy"}
            />
          </picture>
        </div>
      </Link>

      {/* Dot Indicators */}
      <div className="absolute bottom-2.5 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 sm:bottom-5 md:bottom-6">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current
                ? "w-6 bg-white sm:w-8"
                : "w-2 bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
