"use client";

// Wishlist hook — implemented in Sprint 4 with Supabase sync
// Placeholder for now

export function useWishlist() {
  return {
    items: [] as string[],
    isInWishlist: (_productId: string) => false,
    toggleWishlist: async (_productId: string) => {},
    loading: false,
  };
}
