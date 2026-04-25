import { ShieldCheck, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  variant?: "opportunity" | "user";
  size?: "sm" | "md";
  className?: string;
}

export function VerifiedBadge({ variant = "opportunity", size = "sm", className }: VerifiedBadgeProps) {
  const iconSize = size === "sm" ? "w-3 h-3" : "w-4 h-4";
  const containerSize = size === "sm" ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-sm";

  if (variant === "opportunity") {
    return (
      <span
        title="AXIS Verified"
        className={cn(
          "inline-flex items-center gap-1 rounded-full font-medium border bg-blue-950/60 text-blue-300 border-blue-800/40",
          containerSize,
          className
        )}
      >
        <ShieldCheck className={iconSize} />
        AXIS Verified
      </span>
    );
  }

  return (
    <span
      title="Verified Member"
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium border bg-amber-950/60 text-amber-300 border-amber-800/40",
        containerSize,
        className
      )}
    >
      <Star className={iconSize} />
      Verified
    </span>
  );
}
