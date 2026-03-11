"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
  }, [slides.length]);

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning || index === current) return;
      setIsTransitioning(true);
      setCurrent(index);
      resetTimer();
      setTimeout(() => setIsTransitioning(false), 600);
    },
    [current, isTransitioning, resetTimer]
  );

  const prev = useCallback(
    () => goTo((current - 1 + slides.length) % slides.length),
    [current, slides.length, goTo]
  );
  const next = useCallback(
    () => goTo((current + 1) % slides.length),
    [current, slides.length, goTo]
  );

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  return (
    <section className="group/hero relative w-full overflow-hidden bg-neutral-900">
      {/* Slides */}
      <div className="relative h-[200px] sm:h-[280px] md:h-[420px] lg:h-[460px] xl:h-[500px]">
        {slides.map((slide, i) => (
          <Link
            key={i}
            href={slide.href}
            className={`absolute inset-0 transition-opacity duration-600 ease-in-out ${
              i === current ? "z-10 opacity-100" : "z-0 opacity-0"
            }`}
            tabIndex={i === current ? 0 : -1}
          >
            {/* Mobile image */}
            <Image
              src={slide.mobile}
              alt={slide.alt}
              fill
              sizes="100vw"
              className="object-cover md:hidden"
              priority={i === 0}
            />
            {/* Desktop image */}
            <Image
              src={slide.desktop}
              alt={slide.alt}
              fill
              sizes="100vw"
              className="hidden object-cover md:block"
              priority={i === 0}
            />
          </Link>
        ))}
      </div>

      {/* Arrow Controls — desktop only */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/80 p-2 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:scale-110 group-hover/hero:flex lg:left-5 lg:p-2.5"
            aria-label="Previous slide"
          >
            <ChevronLeft className="size-5 text-gray-800 lg:size-6" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/80 p-2 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:scale-110 group-hover/hero:flex lg:right-5 lg:p-2.5"
            aria-label="Next slide"
          >
            <ChevronRight className="size-5 text-gray-800 lg:size-6" />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-2 sm:bottom-5 md:bottom-6">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current
                  ? "w-7 bg-white shadow-sm sm:w-8"
                  : "w-2 bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
