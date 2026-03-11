"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { formatINR } from "@/lib/utils";

export default function CartSidebar() {
  const {
    items,
    isOpen,
    closeCart,
    subtotal,
    itemCount,
    updateQuantity,
    removeItem,
  } = useCart();

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent side="right" className="flex flex-col p-0">
        <SheetHeader className="border-b px-5 py-4">
          <SheetTitle className="flex items-center gap-2 text-base">
            <ShoppingBag className="size-5 text-nexifi-orange" />
            Shopping Cart
            {itemCount > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-nexifi-orange text-[10px] font-bold text-white">
                {itemCount}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-5">
            <div className="flex size-24 items-center justify-center rounded-full bg-muted">
              <ShoppingBag className="size-12 text-muted-foreground/50" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">Your cart is empty</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Looks like you haven&apos;t added anything yet
              </p>
            </div>
            <Link href="/products" onClick={closeCart}>
              <Button className="gap-2 bg-nexifi-orange text-white hover:bg-nexifi-orange-dark">
                Start Shopping
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-5">
              <div className="divide-y">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 py-4">
                    <div className="img-hover-zoom relative size-20 shrink-0 overflow-hidden rounded-lg border bg-muted">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                          No img
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col gap-1">
                      <p className="line-clamp-2 text-sm font-medium leading-tight">
                        {item.name}
                      </p>
                      <p className="text-sm font-bold text-nexifi-orange">
                        {formatINR(item.price)}
                      </p>

                      <div className="mt-auto flex items-center gap-2">
                        <div className="flex items-center rounded-lg border">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.quantity - 1,
                                item.variantId
                              )
                            }
                            className="flex size-8 items-center justify-center rounded-l-lg transition-colors hover:bg-muted active:bg-muted"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="flex w-8 items-center justify-center text-xs font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.productId,
                                item.quantity + 1,
                                item.variantId
                              )
                            }
                            className="flex size-8 items-center justify-center rounded-r-lg transition-colors hover:bg-muted active:bg-muted"
                            aria-label="Increase quantity"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() =>
                            removeItem(item.productId, item.variantId)
                          }
                          className="ml-auto rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          aria-label="Remove item"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <SheetFooter className="border-t shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
              <div className="w-full space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Subtotal
                  </span>
                  <span className="text-xl font-bold">
                    {formatINR(subtotal)}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Shipping & taxes calculated at checkout
                </p>
                <div className="flex flex-col gap-2">
                  <Link href="/checkout" onClick={closeCart} className="w-full">
                    <Button className="w-full gap-2 bg-nexifi-orange text-white hover:bg-nexifi-orange-dark">
                      Checkout
                      <ArrowRight className="size-4" />
                    </Button>
                  </Link>
                  <Link href="/cart" onClick={closeCart} className="w-full">
                    <Button variant="outline" className="w-full">
                      View Cart
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
