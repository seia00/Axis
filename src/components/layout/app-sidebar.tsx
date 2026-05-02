"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutGrid,
  Users,
  Briefcase,
  Rocket,
  TrendingUp,
  Sparkles,
  Calendar,
  BookOpen,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  User,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";

const navItems = [
  { href: "/directory",     labelKey: "nav.directory",     icon: LayoutGrid  },
  { href: "/network",       labelKey: "nav.network",       icon: Users       },
  { href: "/opportunities", labelKey: "nav.opportunities", icon: Briefcase   },
  { href: "/launchpad",     labelKey: "nav.launchpad",     icon: Rocket      },
  { href: "/ventures",      labelKey: "nav.ventures",      icon: TrendingUp  },
  { href: "/match",         labelKey: "nav.match",         icon: Sparkles    },
  { href: "/calendar",      labelKey: "nav.calendar",      icon: Calendar    },
  { href: "/resources",     labelKey: "nav.resources",     icon: BookOpen    },
];

// ─── Shared nav list ──────────────────────────────────────────────────────────
function NavList({
  pathname,
  session,
  collapsed,
  onLinkClick,
}: {
  pathname: string;
  session: ReturnType<typeof useSession>["data"];
  collapsed: boolean;
  onLinkClick?: () => void;
}) {
  const { lang, toggle, t } = useLanguage();

  return (
    <>
      {/* Main nav */}
      <nav className="flex-1 px-1.5 py-3 space-y-px overflow-y-auto">
        {navItems.map(({ href, labelKey, icon: Icon }) => {
          const label = t(labelKey);
          const active = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onLinkClick}
              title={collapsed ? label : undefined}
              className={cn(
                "relative flex items-center gap-2.5 px-2.5 py-1.5 text-[13px] transition-colors duration-100",
                active
                  ? "text-white bg-violet-500/[0.08]"
                  : "text-white/35 hover:text-white/65 hover:bg-white/[0.03]",
                collapsed && "justify-center px-0"
              )}
              style={{ borderRadius: "3px" }}
            >
              {/* Active left-rail indicator */}
              {active && (
                <span
                  className="absolute left-0 top-1 bottom-1 w-[2px] bg-violet-500"
                  style={{ borderRadius: "0 1px 1px 0" }}
                />
              )}
              <Icon className={cn("flex-shrink-0", active ? "text-violet-400" : "text-current")}
                    style={{ width: 15, height: 15 }} />
              {!collapsed && (
                <span className="truncate font-medium">{label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: user actions */}
      <div
        className="px-1.5 py-2 flex-shrink-0 space-y-px"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        {session ? (
          <>
            <Link
              href="/portfolio"
              onClick={onLinkClick}
              title={collapsed ? t("nav.portfolio") : undefined}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-1.5 text-[13px] text-white/35 hover:text-white/65 hover:bg-white/[0.03] transition-colors duration-100",
                collapsed && "justify-center px-0"
              )}
              style={{ borderRadius: "3px" }}
            >
              <User style={{ width: 15, height: 15 }} className="flex-shrink-0" />
              {!collapsed && <span>{t("nav.portfolio")}</span>}
            </Link>

            {(session.user as { role?: string }).role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={onLinkClick}
                title={collapsed ? t("nav.admin") : undefined}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-1.5 text-[13px] text-white/35 hover:text-white/65 hover:bg-white/[0.03] transition-colors duration-100",
                  collapsed && "justify-center px-0"
                )}
                style={{ borderRadius: "3px" }}
              >
                <Shield style={{ width: 15, height: 15 }} className="flex-shrink-0" />
                {!collapsed && <span>{t("nav.admin")}</span>}
              </Link>
            )}

            <Link
              href="/settings"
              onClick={onLinkClick}
              title={collapsed ? t("nav.settings") : undefined}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-1.5 text-[13px] text-white/35 hover:text-white/65 hover:bg-white/[0.03] transition-colors duration-100",
                collapsed && "justify-center px-0"
              )}
              style={{ borderRadius: "3px" }}
            >
              <Settings style={{ width: 15, height: 15 }} className="flex-shrink-0" />
              {!collapsed && <span>{t("nav.settings")}</span>}
            </Link>

            <button
              onClick={() => { onLinkClick?.(); signOut(); }}
              title={collapsed ? t("nav.signout") : undefined}
              className={cn(
                "w-full flex items-center gap-2.5 px-2.5 py-1.5 text-[13px] text-white/35 hover:text-red-400/70 hover:bg-white/[0.03] transition-colors duration-100",
                collapsed && "justify-center px-0"
              )}
              style={{ borderRadius: "3px" }}
            >
              <LogOut style={{ width: 15, height: 15 }} className="flex-shrink-0" />
              {!collapsed && <span>{t("nav.signout")}</span>}
            </button>
          </>
        ) : (
          <Link
            href="/auth/signin"
            onClick={onLinkClick}
            title={collapsed ? t("nav.signin") : undefined}
            className={cn(
              "flex items-center gap-2.5 px-2.5 py-1.5 text-[13px] text-white/35 hover:text-white/65 hover:bg-white/[0.03] transition-colors duration-100",
              collapsed && "justify-center px-0"
            )}
            style={{ borderRadius: "3px" }}
          >
            <User style={{ width: 15, height: 15 }} className="flex-shrink-0" />
            {!collapsed && <span>{t("nav.signin")}</span>}
          </Link>
        )}

        {/* Language toggle */}
        <button
          onClick={toggle}
          title={collapsed ? (lang === "en" ? "日本語" : "English") : undefined}
          className={cn(
            "w-full flex items-center gap-2.5 px-2.5 py-1.5 text-[11px] text-white/25 hover:text-white/50 hover:bg-white/[0.03] transition-colors duration-100 mt-0.5",
            collapsed && "justify-center px-0"
          )}
          style={{ borderRadius: "3px" }}
        >
          <span className="text-[12px] flex-shrink-0 leading-none">{lang === "en" ? "🇯🇵" : "🇬🇧"}</span>
          {!collapsed && <span className="font-mono">{lang === "en" ? "日本語" : "English"}</span>}
        </button>
      </div>
    </>
  );
}

// ─── Main AppSidebar — desktop only ──────────────────────────────────────────
export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);

  const isLanding = pathname === "/";

  const sidebarBase = "fixed left-0 top-0 h-screen z-50 hidden md:flex flex-col transition-[width] duration-200 ease-out overflow-hidden";
  const sidebarBorder = "border-r border-white/[0.06]";

  // ── Landing page: icon-only strip that expands on demand ─────────────────
  if (isLanding) {
    return (
      <div
        className={cn(
          sidebarBase, sidebarBorder,
          "bg-[#05020b]/85 backdrop-blur-md",
          collapsed ? "w-56" : "w-14"
        )}
      >
        <div
          className={cn(
            "flex items-center h-12 px-2 flex-shrink-0",
            collapsed ? "justify-between" : "justify-center"
          )}
          style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
        >
          {collapsed && (
            <Link href="/">
              <Image
                src="/AXISLOGO.png" alt="AXIS" width={60} height={30}
                className="h-4 w-auto object-contain opacity-60"
              />
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 text-white/20 hover:text-white/55 hover:bg-white/[0.04] transition-all"
            aria-label={collapsed ? "Collapse" : "Open navigation"}
            style={{ borderRadius: "3px" }}
          >
            {collapsed ? <ChevronLeft style={{ width: 14, height: 14 }} /> : <Menu style={{ width: 14, height: 14 }} />}
          </button>
        </div>

        <NavList
          pathname={pathname}
          session={session}
          collapsed={!collapsed}
          onLinkClick={() => setCollapsed(false)}
        />
      </div>
    );
  }

  // ── Inner pages: full sidebar ─────────────────────────────────────────────
  return (
    <div
      className={cn(
        sidebarBase, sidebarBorder,
        "bg-[#05020b]",
        collapsed ? "w-14" : "w-56"
      )}
    >
      {/* Logo row */}
      <div
        className={cn(
          "flex items-center h-12 px-2 flex-shrink-0",
          collapsed ? "justify-center" : "justify-between px-3"
        )}
        style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
      >
        {!collapsed && (
          <Link href="/">
            <Image
              src="/AXISLOGO.png" alt="AXIS" width={64} height={32}
              className="h-4 w-auto object-contain opacity-75 hover:opacity-100 transition-opacity"
            />
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? "Expand" : "Collapse"}
          className="p-1.5 text-white/20 hover:text-white/50 hover:bg-white/[0.04] transition-all flex-shrink-0"
          style={{ borderRadius: "3px" }}
        >
          {collapsed
            ? <ChevronRight style={{ width: 14, height: 14 }} />
            : <ChevronLeft  style={{ width: 14, height: 14 }} />
          }
        </button>
      </div>

      <NavList pathname={pathname} session={session} collapsed={collapsed} />
    </div>
  );
}
