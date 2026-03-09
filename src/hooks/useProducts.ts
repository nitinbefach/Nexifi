"use client";

// Product fetching hook with filters — implemented in Sprint 3
// Uses TanStack React Query for caching

export function useProducts() {
  return {
    products: [],
    loading: false,
    error: null,
  };
}
