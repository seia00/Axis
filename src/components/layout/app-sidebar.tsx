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
  X,
  User,
  Shield,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";

// Main nav — labelKey maps to translation
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

// Bottom nav shows 5 items; rest go in "More" drawer
const BOTTOM_NAV_ITEMS = navItems.slice(0, 5);

// ─── Shared nav list (desktop sidebar) ───────────────────────────────────────
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
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
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
                "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-150",
                active
                  ? "text-white bg-white/[0.06]"
                  : "text-white/40 hover:text-white/80 hover:bg-white/[0.04]",
                collapsed && "justify-center"
              )}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: user actions */}
      <div className="px-2 py-3 border-t border-white/[0.04] space-y-0.5 flex-shrink-0">
        {session ? (
          <>
            <Link
              href="/portfolio"
              onClick={onLinkClick}
              title={collapsed ? t("nav.portfolio") : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.04] transition-all duration-150",
                collapsed && "justify-center"
              )}
            >
              <User className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span>{t("nav.portfolio")}</span>}
            </Link>
            {(session.user as { role?: string }).role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={onLinkClick}
                title={collapsed ? t("nav.admin") : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.04] transition-all duration-150",
                  collapsed && "justify-center"
                )}
              >
                <Shield className="w-[18px] h-[18px] flex-shrink-0" />
                {!collapsed && <span>{t("nav.admin")}</span>}
              </Link>
            )}
            <Link
              href="/settings"
              onClick={onLinkClick}
              title={collapsed ? t("nav.settings") : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.04] transition-all duration-150",
                collapsed && "justify-center"
              )}
            >
              <Settings className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span>{t("nav.settings")}</span>}
            </Link>
            <button
              onClick={() => { onLinkClick?.(); signOut(); }}
              title={collapsed ? t("nav.signout") : undefined}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-white/40 hover:text-red-400/80 hover:bg-white/[0.04] transition-all duration-150",
                collapsed && "justify-center"
              )}
            >
              <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span>{t("nav.signout")}</span>}
            </button>
          </>
        ) : (
          <Link
            href="/auth/signin"
            onClick={onLinkClick}
            title={collapsed ? t("nav.signin") : undefined}
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.04] transition-all duration-150",
              collapsed && "justify-center"
            )}
          >
            <User className="w-[18px] h-[18px] flex-shrink-0" />
            {!collapsed && <span>{t("nav.signin")}</span>}
          </Link>
        )}

        {/* Language toggle */}
        <button
          onClick={toggle}
          title={collapsed ? (lang === "en" ? "日本語" : "English") : undefined}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 mt-1 text-xs rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all duration-150",
            collapsed && "justify-center"
          )}
        >
          <span className="text-[13px] flex-shrink-0">{lang === "en" ? "🇯🇵" : "🇬🇧"}</span>
          {!collapsed && <span>{lang === "en" ? "日本語" : "English"}</span>}
        </button>
      </div>
    </>
  );
}

// ─── Mobile full drawer (opened by "More") ────────────────────────────────────
function MobileDrawer({
  pathname,
  session,
  onClose,
}: {
  pathname: string;
  session: ReturnType<typeof useSession>["data"];
  onClose: () => void;
}) {
  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed left-0 top-0 h-screen w-64 z-50 bg-[#09090b] border-r border-white/[0.06] flex flex-col">
        <div className="flex items-center justify-between px-4 h-14 border-b border-white/[0.04] flex-shrink-0">
          <Link href="/" onClick={onClose}>
            <Image
              src="/AXISLOGO.png"
              alt="AXIS"
              width={72}
              height={36}
              className="h-5 w-auto object-contain opacity-80"
            />
          </Link>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.04] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <NavList
          pathname={pathname}
          session={session}
          collapsed={false}
          onLinkClick={onClose}
        />
      </div>
    </>
  );
}

// ─── Mobile bottom navigation bar ─────────────────────────────────────────────
function BottomNav({
  pathname,
  onMoreClick,
}: {
  pathname: string;
  onMoreClick: () => void;
}) {
  const { t } = useLanguage();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#09090b]/95 backdrop-blur-md border-t border-white/[0.06] safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-1">
        {BOTTOM_NAV_ITEMS.map(({ href, labelKey, icon: Icon }) => {
          const label = t(labelKey);
          const active = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 py-2 rounded-xl transition-all duration-150",
                active ? "text-white" : "text-white/35 hover:text-white/70"
              )}
            >
              <Icon className={cn("w-5 h-5", active && "drop-shadow-[0_0_6px_rgba(139,92,246,0.7)]")} />
              <span className="text-[9px] font-medium tracking-wide truncate max-w-[52px] text-center leading-none">
                {label}
              </span>
            </Link>
          );
        })}

        {/* More button */}
        <button
          onClick={onMoreClick}
          className="flex flex-col items-center justify-center gap-0.5 flex-1 py-2 rounded-xl text-white/35 hover:text-white/70 transition-all duration-150"
        >
          <MoreHorizontal className="w-5 h-5" />
          <span className="text-[9px] font-medium tracking-wide leading-none">{t("nav.more")}</span>
        </button>
      </div>
    </nav>
  );
}

// ─── Main AppSidebar ──────────────────────────────────────────────────────────
export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLanding = pathname === "/";

  // ── Landing page: icon-strip that expands on demand ───────────────────────
  if (isLanding) {
    return (
      <>
        {/* Desktop: collapsed icon-strip (64px) — expand button at top */}
        <div
          className={cn(
            "fixed left-0 top-0 h-screen z-50 bg-[#09090b]/80 backdrop-blur-md border-r border-white/[0.04] hidden md:flex flex-col transition-[width] duration-200 ease-out overflow-hidden",
            collapsed ? "w-60" : "w-16"
          )}
        >
          <div className={cn(
            "flex items-center border-b border-white/[0.04] h-14 px-3 flex-shrink-0",
            collapsed ? "justify-between" : "justify-center"
          )}>
            {collapsed && (
              <Link href="/">
                <Image
                  src="/AXISLOGO.png"
                  alt="AXIS"
                  width={64}
                  height={32}
                  className="h-5 w-auto object-contain opacity-70"
                />
              </Link>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-lg text-white/20 hover:text-white/60 hover:bg-white/[0.04] transition-all duration-150"
              aria-label={collapsed ? "Collapse sidebar" : "Open navigation"}
            >
              {collapsed ? (
                <ChevronLeft className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </button>
          </div>

          <NavList
            pathname={pathname}
            session={session}
            collapsed={!collapsed}
            onLinkClick={() => setCollapsed(false)}
          />
        </div>

        {/* Mobile: bottom nav bar */}
        <BottomNav pathname={pathname} onMoreClick={() => setMobileOpen(true)} />

        {mobileOpen && (
          <MobileDrawer
            pathname={pathname}
            session={session}
            onClose={() => setMobileOpen(false)}
          />
        )}
      </>
    );
  }

  // ── Inner pages: full sidebar, always visible on desktop ──────────────────
  return (
    <>
      {/* Desktop sidebar */}
      <div
        className={cn(
          "fixed left-0 top-0 h-screen z-40 bg-[#09090b] border-r border-white/[0.06] hidden md:flex flex-col transition-[width] duration-200 ease-out overflow-hidden",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {/* Logo + collapse toggle */}
        <div
          className={cn(
            "flex items-center border-b border-white/[0.04] h-14 px-3 flex-shrink-0",
            collapsed ? "justify-center" : "justify-between px-4"
          )}
        >
          {!collapsed && (
            <Link href="/">
              <Image
                src="/AXISLOGO.png"
                alt="AXIS"
                width={72}
                height={36}
                className="h-5 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
              />
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="p-2 rounded-lg text-white/20 hover:text-white/50 hover:bg-white/[0.04] transition-all duration-150 flex-shrink-0"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        <NavList
          pathname={pathname}
          session={session}
          collapsed={collapsed}
        />
      </div>

      {/* Mobile: bottom nav bar */}
      <BottomNav pathname={pathname} onMoreClick={() => setMobileOpen(true)} />

      {mobileOpen && (
        <MobileDrawer
          pathname={pathname}
          session={session}
          onClose={() => setMobileOpen(false)}
        />
      )}
    </>
  );
}
