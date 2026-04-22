"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface SidebarItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string | number;
}

interface SidebarProps {
  items: SidebarItem[];
  title?: string;
}

export function Sidebar({ items, title }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-56 flex-shrink-0">
      {title && (
        <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3 px-3">
          {title}
        </p>
      )}
      <nav className="space-y-0.5">
        {items.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname === href || pathname?.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center justify-between gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors",
                active
                  ? "bg-indigo-600/10 text-indigo-400 border border-indigo-600/20"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-raised)]"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={cn("w-4 h-4 flex-shrink-0", active ? "text-indigo-400" : "")} />
                {label}
              </div>
              {badge !== undefined && (
                <span className="px-1.5 py-0.5 text-xs rounded-full bg-indigo-600/20 text-indigo-300 font-medium">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
