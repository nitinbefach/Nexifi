"use client";

import React, { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface WishlistButtonProps {
  productId: string;
  className?: string;
}

export default function WishlistButton({ productId, className }: WishlistButtonProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    toast.info(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className={`size-9 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white ${className ?? ""}`}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={`size-4 transition-colors ${
          isWishlisted
            ? "fill-red-500 text-red-500"
            : "text-muted-foreground"
        }`}
      />
    </Button>
  );
}
