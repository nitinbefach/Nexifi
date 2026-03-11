"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  autoFocus?: boolean;
  onSubmit?: () => void;
}

export default function SearchBar({ autoFocus, onSubmit }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
      setQuery("");
      onSubmit?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="I am shopping for..."
        className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-9 text-sm outline-none transition-all duration-200 placeholder:text-muted-foreground focus:border-nexifi-orange focus:bg-white focus:ring-2 focus:ring-nexifi-orange/20 sm:h-10"
        autoFocus={autoFocus}
      />
      {query && (
        <button
          type="button"
          onClick={() => setQuery("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="size-3.5" />
        </button>
      )}
    </form>
  );
}
