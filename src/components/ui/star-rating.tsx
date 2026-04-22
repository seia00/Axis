"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

interface StarRatingProps {
  rating?: number;
  maxRating?: number;
  interactive?: boolean;
  size?: "sm" | "md" | "lg";
  onRate?: (rating: number) => void;
  className?: string;
}

export function StarRating({
  rating = 0,
  maxRating = 5,
  interactive = false,
  size = "md",
  onRate,
  className,
}: StarRatingProps) {
  const [hovered, setHovered] = useState(0);

  const sizeClass = {
    sm: "w-3.5 h-3.5",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  }[size];

  const displayRating = interactive ? (hovered || rating) : rating;

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {Array.from({ length: maxRating }, (_, i) => i + 1).map((star) => (
        <svg
          key={star}
          className={cn(
            sizeClass,
            "transition-colors",
            interactive && "cursor-pointer",
            star <= displayRating ? "text-amber-400" : "text-[var(--border)]"
          )}
          fill="currentColor"
          viewBox="0 0 20 20"
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onRate?.(star)}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}
