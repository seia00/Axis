import { cn } from "@/lib/utils";
import { OrgTier } from "@prisma/client";
import { ShieldCheck, Star, Users } from "lucide-react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "member" | "verified" | "partner" | "success" | "warning" | "danger" | "muted";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full",
        {
          "bg-[var(--surface-overlay)] text-[var(--muted-foreground)] border border-[var(--border)]": variant === "default",
          "bg-indigo-950/80 text-indigo-300 border border-indigo-800/40": variant === "member",
          "bg-violet-950/80 text-violet-300 border border-violet-800/40": variant === "verified",
          "bg-amber-950/80 text-amber-300 border border-amber-800/40": variant === "partner",
          "bg-emerald-950/80 text-emerald-300 border border-emerald-800/40": variant === "success",
          "bg-yellow-950/80 text-yellow-300 border border-yellow-800/40": variant === "warning",
          "bg-red-950/80 text-red-300 border border-red-800/40": variant === "danger",
          "bg-[var(--muted)] text-[var(--muted-foreground)]": variant === "muted",
        },
        className
      )}
    >
      {children}
    </span>
  );
}

export function TierBadge({ tier }: { tier: OrgTier }) {
  if (tier === "PARTNER") {
    return (
      <Badge variant="partner">
        <Star className="w-3 h-3" />
        AXIS Partner
      </Badge>
    );
  }
  if (tier === "VERIFIED") {
    return (
      <Badge variant="verified">
        <ShieldCheck className="w-3 h-3" />
        AXIS Verified
      </Badge>
    );
  }
  return (
    <Badge variant="member">
      <Users className="w-3 h-3" />
      AXIS Member
    </Badge>
  );
}
