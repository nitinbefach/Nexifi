import React from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  count?: number;
  size?: "sm" | "md" | "lg";
}

const iconSizes = {
  sm: "size-3.5",
  md: "size-4",
  lg: "size-5",
};

const textSizes = {
  sm: "text-[11px]",
  md: "text-xs",
  lg: "text-sm",
};

export default function StarRating({ rating, count, size = "md" }: StarRatingProps) {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const filled = i < Math.round(rating);
    return (
      <Star
        key={i}
        className={`${iconSizes[size]} ${
          filled
            ? "fill-amber-400 text-amber-400"
            : "fill-none text-gray-300"
        }`}
      />
    );
  });

  return (
    <div className="flex items-center gap-1">
      <div className="flex">{stars}</div>
      <span className={`${textSizes[size]} text-muted-foreground`}>
        {rating.toFixed(1)}
        {count !== undefined && ` (${count})`}
      </span>
    </div>
  );
}
