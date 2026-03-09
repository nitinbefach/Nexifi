"use client";

import { create } from "zustand";

export interface RecentlyViewedProduct {
  id: string;
  name: string;
  slug: string;
  image: string;
  sellingPrice: number;
  originalPrice: number;
}

interface RecentlyViewedStore {
  products: RecentlyViewedProduct[];
  addProduct: (product: RecentlyViewedProduct) => void;
  clearAll: () => void;
}

const MAX_ITEMS = 10;

export const useRecentlyViewedStore = create<RecentlyViewedStore>((set) => ({
  products: [],

  addProduct: (product) => {
    set((state) => {
      // Remove if already exists (move to front)
      const filtered = state.products.filter((p) => p.id !== product.id);
      // Add to front, keep max items
      const updated = [product, ...filtered].slice(0, MAX_ITEMS);
      return { products: updated };
    });
  },

  clearAll: () => set({ products: [] }),
}));
