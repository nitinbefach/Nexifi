"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";

interface BuyNowButtonProps {
  productId: string;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  variantId?: string;
  quantity?: number;
  className?: string;
  /** Compact variant for mobile bottom bar */
  compact?: boolean;
}

export default function BuyNowButton({
  productId,
  name,
  image,
  price,
  originalPrice,
  variantId,
  quantity = 1,
  className,
  compact,
}: BuyNowButtonProps) {
  const router = useRouter();
  const { addToCart } = useCart();

  const handleBuyNow = () => {
    addToCart({ productId, name, image, price, originalPrice, variantId, quantity });
    router.push("/checkout");
  };

  if (compact) {
    return (
      <button
        onClick={handleBuyNow}
        className={`flex flex-1 items-center justify-center gap-2 rounded-lg bg-nexifi-orange py-2.5 text-sm font-semibold text-white transition-colors active:bg-nexifi-orange-dark ${className ?? ""}`}
      >
        <Zap className="size-4" />
        Buy Now
      </button>
    );
  }

  return (
    <Button
      onClick={handleBuyNow}
      className={`bg-nexifi-orange text-white hover:bg-nexifi-orange-dark ${className ?? ""}`}
      size="lg"
    >
      <Zap className="size-4" />
      Buy Now
    </Button>
  );
}
