import React from "react";
import Link from "next/link";
import Image from "next/image";
import { LayoutGrid } from "lucide-react";
import type { Category } from "@/types/product";

interface CategoryGridProps {
  categories: Category[];
}

const gradients = [
  "from-orange-500 to-red-500",
  "from-purple-500 to-indigo-500",
  "from-blue-500 to-cyan-500",
  "from-green-500 to-emerald-500",
  "from-pink-500 to-rose-500",
  "from-amber-500 to-yellow-500",
  "from-teal-500 to-cyan-500",
  "from-violet-500 to-purple-500",
];

export default function CategoryGrid({ categories }: CategoryGridProps) {
  if (categories.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No categories available.</p>
    );
  }

  return (
    <>
      {/* Mobile: horizontal scroll */}
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-2 md:hidden">
        {categories.map((cat, i) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="group relative flex h-28 w-28 shrink-0 flex-col items-center justify-center overflow-hidden rounded-2xl transition-transform duration-200 active:scale-95 sm:h-32 sm:w-32"
          >
            {cat.image_url ? (
              <Image
                src={cat.image_url}
                alt={cat.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
                sizes="128px"
              />
            ) : (
              <div
                className={`absolute inset-0 bg-gradient-to-br ${gradients[i % gradients.length]}`}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="relative z-10 mt-auto px-2 pb-3 text-center">
              <span className="text-xs font-semibold text-white drop-shadow-sm sm:text-sm">
                {cat.name}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Desktop: grid */}
      <div className="hidden gap-4 md:grid md:grid-cols-4 lg:gap-5">
        {categories.map((cat, i) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="img-hover-zoom group relative flex h-44 items-end overflow-hidden rounded-2xl lg:h-52"
          >
            {cat.image_url ? (
              <Image
                src={cat.image_url}
                alt={cat.name}
                fill
                className="object-cover transition-transform duration-400 group-hover:scale-108"
                sizes="25vw"
              />
            ) : (
              <div
                className={`absolute inset-0 bg-gradient-to-br ${gradients[i % gradients.length]} transition-opacity group-hover:opacity-90`}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent transition-colors group-hover:from-black/70" />
            <div className="relative z-10 flex w-full items-center justify-between px-5 pb-4">
              <div>
                <span className="text-base font-bold text-white drop-shadow-sm lg:text-lg">
                  {cat.name}
                </span>
              </div>
              <LayoutGrid className="size-5 text-white/70 transition-colors group-hover:text-white" />
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
