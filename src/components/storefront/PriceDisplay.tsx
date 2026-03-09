// PriceDisplay: Will show original and selling prices with discount percentage badge.
// Handles formatting for INR currency.

import React from "react";

interface PriceDisplayProps {
  originalPrice: number;
  sellingPrice: number;
}

export default function PriceDisplay({ originalPrice, sellingPrice }: PriceDisplayProps) {
  const discount = Math.round(((originalPrice - sellingPrice) / originalPrice) * 100);

  return (
    <div className="flex items-center gap-2">
      <span className="text-lg font-bold">Rs. {sellingPrice}</span>
      {originalPrice > sellingPrice && (
        <>
          <span className="text-sm text-muted-foreground line-through">
            Rs. {originalPrice}
          </span>
          <span className="text-sm font-medium text-green-600">{discount}% off</span>
        </>
      )}
    </div>
  );
}
