"use client";

// Search hook with debounce — implemented in Sprint 3
// Uses Supabase full-text search

export function useSearch() {
  return {
    query: "",
    results: [],
    loading: false,
    setQuery: (_q: string) => {},
  };
}
