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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/language-context";

const navItems = [
  { href: "/directory",     label: "Directory",     icon: LayoutGrid },
  { href: "/network",       label: "Network",       icon: Users },
  { href: "/opportunities", label: "Opportunities", icon: Briefcase },
  { href: "/launchpad",     label: "Launch Pad",    icon: Rocket },
  { href: "/ventures",      label: "Ventures",      icon: TrendingUp },
  { href: "/match",         label: "Match",         icon: Sparkles },
  { href: "/calendar",      label: "Calendar",      icon: Calendar },
  { href: "/resources",     label: "Resources",     icon: BookOpen },
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
  const { lang, toggle } = useLanguage();
  return (
    <>
      {/* Main nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
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
              title={collapsed ? "Portfolio" : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.04] transition-all duration-150",
                collapsed && "justify-center"
              )}
            >
              <User className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span>Portfolio</span>}
            </Link>
            {(session.user as { role?: string }).role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={onLinkClick}
                title={collapsed ? "Admin" : undefined}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.04] transition-all duration-150",
                  collapsed && "justify-center"
                )}
              >
                <Shield className="w-[18px] h-[18px] flex-shrink-0" />
                {!collapsed && <span>Admin</span>}
              </Link>
            )}
            <Link
              href="/settings"
              onClick={onLinkClick}
              title={collapsed ? "Settings" : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.04] transition-all duration-150",
                collapsed && "justify-center"
              )}
            >
              <Settings className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span>Settings</span>}
            </Link>
            <button
              onClick={() => { onLinkClick?.(); signOut(); }}
              title={collapsed ? "Sign out" : undefined}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-white/40 hover:text-red-400/80 hover:bg-white/[0.04] transition-all duration-150",
                collapsed && "justify-center"
              )}
            >
              <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span>Sign out</span>}
            </button>
          </>
        ) : (
          <Link
            href="/auth/signin"
            onClick={onLinkClick}
            title={collapsed ? "Sign in" : undefined}
            className={cn(
              "flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.04] transition-all duration-150",
              collapsed && "justify-center"
            )}
          >
            <User className="w-[18px] h-[18px] flex-shrink-0" />
            {!collapsed && <span>Sign in</span>}
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

// ─── Mobile drawer ────────────────────────────────────────────────────────────
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
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="fixed left-0 top-0 h-screen w-64 z-50 bg-[#09090b] border-r border-white/[0.06] flex flex-col">
        {/* Header */}
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
          {/* Toggle button at top */}
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

        {/* Mobile: hamburger in top-right corner */}
        <button
          className="fixed top-4 right-4 z-50 md:hidden p-2 rounded-lg text-white/30 hover:text-white/70 transition-colors"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

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

      {/* Mobile: hamburger top-left */}
      <button
        className="fixed top-3 left-3 z-50 md:hidden p-2 rounded-lg bg-[#09090b]/90 backdrop-blur-sm border border-white/[0.06] text-white/40 hover:text-white/80 transition-colors"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="w-4 h-4" />
      </button>

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
