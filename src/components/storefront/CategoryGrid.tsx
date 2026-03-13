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
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4 lg:gap-5">
      {categories.map((cat, i) => (
        <Link
          key={cat.id}
          href={`/categories/${cat.slug}`}
          className="img-hover-zoom group relative flex h-32 items-end overflow-hidden rounded-2xl sm:h-36 md:h-44 lg:h-52"
        >
          {cat.image_url ? (
            <Image
              src={cat.image_url}
              alt={cat.name}
              fill
              className="object-cover transition-transform duration-400 group-hover:scale-108"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div
              className={`absolute inset-0 bg-gradient-to-br ${gradients[i % gradients.length]} transition-opacity group-hover:opacity-90`}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent transition-colors group-hover:from-black/70" />
          <div className="relative z-10 flex w-full items-center justify-between px-3 pb-3 md:px-5 md:pb-4">
            <span className="text-xs font-bold text-white drop-shadow-sm sm:text-sm md:text-base lg:text-lg">
              {cat.name}
            </span>
            <LayoutGrid className="hidden size-5 text-white/70 transition-colors group-hover:text-white md:block" />
          </div>
        </Link>
      ))}
    </div>
  );
}
