"use client";

import { create } from "zustand";

interface ProductPageData {
  productId: string;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  variantId?: string;
}

interface ProductPageStore {
  product: ProductPageData | null;
  setProduct: (data: ProductPageData) => void;
  setVariant: (variantId: string | undefined) => void;
  clearProduct: () => void;
}

export const useProductPageStore = create<ProductPageStore>((set) => ({
  product: null,
  setProduct: (data) => set({ product: data }),
  setVariant: (variantId) =>
    set((state) =>
      state.product ? { product: { ...state.product, variantId } } : state
    ),
  clearProduct: () => set({ product: null }),
}));
