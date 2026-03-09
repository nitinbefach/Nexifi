"use client";

import { useCartStore } from "@/stores/cart-store";
import { toast } from "sonner";

export function useCart() {
  const store = useCartStore();

  const addToCart = (product: {
    productId: string;
    name: string;
    image: string;
    price: number;
    originalPrice: number;
    variantId?: string;
    quantity?: number;
  }) => {
    store.addItem({
      productId: product.productId,
      variantId: product.variantId,
      name: product.name,
      image: product.image,
      price: product.price,
      originalPrice: product.originalPrice,
      quantity: product.quantity || 1,
    });
    toast.success(`${product.name} added to cart`);
    store.openCart();
  };

  return {
    items: store.items,
    isOpen: store.isOpen,
    itemCount: store.getItemCount(),
    subtotal: store.getSubtotal(),
    addToCart,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
    toggleCart: store.toggleCart,
    openCart: store.openCart,
    closeCart: store.closeCart,
  };
}
