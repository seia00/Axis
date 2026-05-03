"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Modal({ open, onClose, title, description, children, size = "md", className }: ModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  const sizeClass = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  }[size];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        style={{ backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
        onClick={onClose}
      />
      <div
        className={cn(
          "liquid-glass-strong relative w-full animate-slide-up",
          sizeClass,
          className
        )}
        style={{ borderRadius: 8 }}
      >
        {(title || description) && (
          <div className="flex items-start justify-between p-6 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div>
              {title && <h2 className="text-base font-semibold text-[var(--foreground)]">{title}</h2>}
              {description && <p className="text-sm text-[var(--muted-foreground)] mt-1">{description}</p>}
            </div>
            <button
              onClick={onClose}
              className="btn-ghost p-1.5 ml-4"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
