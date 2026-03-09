"use client";

import React, { useState } from "react";
import { ShoppingCart, Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";

interface AddToCartButtonProps {
  productId: string;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  variantId?: string;
  disabled?: boolean;
  className?: string;
}

export default function AddToCartButton({
  productId,
  name,
  image,
  price,
  originalPrice,
  variantId,
  disabled,
  className,
}: AddToCartButtonProps) {
  const [state, setState] = useState<"idle" | "loading" | "success">("idle");
  const { addToCart } = useCart();

  const handleClick = async () => {
    if (state !== "idle") return;
    setState("loading");

    // Small delay for visual feedback
    await new Promise((r) => setTimeout(r, 300));
    addToCart({ productId, name, image, price, originalPrice, variantId });
    setState("success");

    setTimeout(() => setState("idle"), 1500);
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || state === "loading"}
      className={`bg-nexifi-orange text-white hover:bg-nexifi-orange-dark ${className ?? ""}`}
      size="lg"
    >
      {state === "loading" && <Loader2 className="size-4 animate-spin" />}
      {state === "success" && <Check className="size-4" />}
      {state === "idle" && <ShoppingCart className="size-4" />}
      <span>
        {state === "loading" ? "Adding..." : state === "success" ? "Added!" : "Add to Cart"}
      </span>
    </Button>
  );
}
