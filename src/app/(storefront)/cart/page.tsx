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
      <div className="animate-fade-in mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center gap-4 px-4 py-8">
        <div className="flex size-24 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="size-12 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-bold sm:text-2xl">Your cart is empty</h1>
        <p className="text-sm text-muted-foreground">
          Looks like you haven&apos;t added anything yet
        </p>
        <Link href="/products">
          <Button className="mt-2 rounded-xl bg-nexifi-orange text-white hover:bg-nexifi-orange-dark">
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="flex items-center gap-3">
        <Link href="/products" className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <ArrowLeft className="size-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold sm:text-2xl md:text-3xl">Your Cart</h1>
          <div className="mt-1 h-1 w-10 rounded-full bg-nexifi-orange md:w-12" />
        </div>
        <span className="ml-1 text-sm text-muted-foreground">({itemCount} items)</span>
      </div>

      <div className="mt-6 flex flex-col gap-6 lg:mt-8 lg:flex-row lg:gap-8">
        {/* Cart Items */}
        <div className="flex-1 space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 rounded-2xl border bg-card p-4 transition-shadow hover:shadow-sm"
            >
              {/* Image */}
              <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted/50 sm:size-24">
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
                  <span className="text-sm font-bold text-foreground sm:text-base">
                    {formatINR(item.price)}
                  </span>
                  {item.originalPrice > item.price && (
                    <span className="text-xs text-muted-foreground line-through">
                      {formatINR(item.originalPrice)}
                    </span>
                  )}
                </div>

                <div className="mt-auto flex items-center gap-2">
                  <div className="flex items-center overflow-hidden rounded-xl border">
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity - 1, item.variantId)
                      }
                      className="flex size-9 items-center justify-center transition-colors hover:bg-muted active:bg-muted/70"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <span className="flex w-10 items-center justify-center border-x text-sm font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.productId, item.quantity + 1, item.variantId)
                      }
                      className="flex size-9 items-center justify-center transition-colors hover:bg-muted active:bg-muted/70"
                      aria-label="Increase quantity"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </div>
                  <span className="ml-auto text-sm font-bold">
                    {formatINR(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <aside className="w-full rounded-2xl border bg-card p-5 lg:w-80 lg:self-start">
          <h2 className="text-lg font-bold">Order Summary</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
              <span className="font-medium">{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-medium text-green-600">
                {subtotal >= 999 ? "Free" : "₹49"}
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
            <p className="mt-3 rounded-xl bg-nexifi-orange/10 px-3 py-2.5 text-xs font-medium text-nexifi-orange">
              Add ₹{(999 - subtotal).toLocaleString("en-IN")} more for free shipping!
            </p>
          )}
          {/* Actions — hidden on mobile (bottom bar handles it) */}
          <div className="hidden md:block">
            <Link href="/checkout" className="mt-5 block">
              <Button className="w-full rounded-xl bg-nexifi-orange text-white hover:bg-nexifi-orange-dark" size="lg">
                Proceed to Checkout
              </Button>
            </Link>
            <Link
              href="/products"
              className="mt-3 block text-center text-sm text-muted-foreground transition-colors hover:text-nexifi-orange"
            >
              Continue Shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
