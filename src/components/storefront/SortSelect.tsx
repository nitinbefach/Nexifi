"use client";

import { useRouter } from "next/navigation";

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Best Rating" },
  { value: "best-selling", label: "Best Selling" },
];

interface SortSelectProps {
  currentSort: string;
  baseUrl: string;
}

export default function SortSelect({ currentSort, baseUrl }: SortSelectProps) {
  const router = useRouter();

  return (
    <select
      value={currentSort}
      onChange={(e) => {
        const val = e.target.value;
        const separator = baseUrl.includes("?") ? "&" : "?";
        const url = val === "newest" ? baseUrl : `${baseUrl}${separator}sort=${val}`;
        router.push(url);
      }}
      className="h-9 cursor-pointer rounded-lg border bg-background px-3 text-sm transition-colors hover:border-nexifi-orange/40"
    >
      {sortOptions.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
