"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { formatINR } from "@/lib/utils";

export default function CartPage() {
  const { items, subtotal, itemCount, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center gap-4 px-4 py-8">
        <div className="flex size-24 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="size-12 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="text-sm text-muted-foreground">
          Looks like you haven&apos;t added anything yet
        </p>
        <Link href="/products">
          <Button className="mt-2 bg-nexifi-orange text-white hover:bg-nexifi-orange-dark">
            Add Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="flex items-center gap-3">
        <Link href="/products" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-5" />
        </Link>
        <h1 className="text-2xl font-bold sm:text-3xl">Your Cart</h1>
        <span className="text-sm text-muted-foreground">({itemCount} items)</span>
      </div>

      <div className="mt-6 flex flex-col gap-6 lg:mt-8 lg:flex-row lg:gap-8">
        {/* Cart Items */}
        <div className="flex-1 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 rounded-xl border p-4"
            >
              {/* Image */}
              <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted sm:size-24">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                    No img
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-medium leading-tight sm:text-base">
                    {item.name}
                  </h3>
                  <button
                    onClick={() => removeItem(item.productId, item.variantId)}
                    className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Remove item"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-bold text-nexifi-orange sm:text-base">
                    {formatINR(item.price)}
                  </span>
                  {item.originalPrice > item.price && (
                    <span className="text-xs text-muted-foreground line-through">
                      {formatINR(item.originalPrice)}
                    </span>
                  )}
                </div>

                <div className="mt-auto flex items-center gap-2">
                  <div className="flex items-center rounded-lg border">
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1, item.variantId)
                      }
                      className="flex size-8 items-center justify-center rounded-l-lg transition-colors hover:bg-muted"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="flex w-10 items-center justify-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1, item.variantId)
                      }
                      className="flex size-8 items-center justify-center rounded-r-lg transition-colors hover:bg-muted"
                      aria-label="Increase quantity"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <span className="ml-auto text-sm font-semibold">
                    {formatINR(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <aside className="w-full rounded-xl border p-5 lg:w-80 lg:self-start">
          <h2 className="text-lg font-semibold">Order Summary</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
              <span className="font-medium">{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium text-green-600">
                {subtotal >= 999 ? "Free" : "Rs. 49"}
              </span>
            </div>
            <div className="flex justify-between border-t pt-3 text-base font-bold">
              <span>Total</span>
              <span className="text-nexifi-orange">
                {formatINR(subtotal + (subtotal >= 999 ? 0 : 49))}
              </span>
            </div>
          </div>
          {subtotal < 999 && (
            <p className="mt-3 rounded-lg bg-nexifi-orange/10 p-2.5 text-xs text-nexifi-orange">
              Add Rs. {(999 - subtotal).toLocaleString("en-IN")} more for free shipping!
            </p>
          )}
          {/* Actions — hidden on mobile (bottom bar handles it) */}
          <div className="hidden md:block">
            <Link href="/checkout" className="mt-4 block">
              <Button className="w-full bg-nexifi-orange text-white hover:bg-nexifi-orange-dark" size="lg">
                Proceed to Checkout
              </Button>
            </Link>
            <Link
              href="/products"
              className="mt-2 block text-center text-sm text-muted-foreground hover:text-nexifi-orange"
            >
              Continue Shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
