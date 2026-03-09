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
    <div className="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-4 md:gap-5 lg:gap-6">
      {categories.map((cat, i) => (
        <Link
          key={cat.id}
          href={`/categories/${cat.slug}`}
          className="group relative flex h-24 items-center justify-center overflow-hidden rounded-xl ring-2 ring-transparent transition-all duration-200 hover:shadow-lg hover:ring-nexifi-orange/30 sm:h-32 md:h-44 lg:h-48"
        >
          {cat.image_url ? (
            <Image
              src={cat.image_url}
              alt={cat.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div
              className={`absolute inset-0 bg-gradient-to-br ${gradients[i % gradients.length]} opacity-90 transition-opacity group-hover:opacity-100`}
            />
          )}
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 flex flex-col items-center gap-1.5 text-white md:gap-3">
            <LayoutGrid className="size-6 sm:size-8 md:size-10 lg:size-12" />
            <span className="text-xs font-medium sm:text-base md:text-lg">
              {cat.name}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}
