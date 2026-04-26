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

// ─── Mobile drawer content ────────────────────────────────────────────────────
function MobileNav({
  pathname,
  session,
  onClose,
}: {
  pathname: string;
  session: ReturnType<typeof useSession>["data"];
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-5 border-b border-white/[0.04]">
        <Link href="/" onClick={onClose}>
          <Image
            src="/AXISLOGO.png"
            alt="AXIS"
            width={80}
            height={40}
            className="h-6 w-auto object-contain opacity-80"
          />
        </Link>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.04] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all duration-150",
                active
                  ? "text-white bg-white/[0.06]"
                  : "text-white/40 hover:text-white/80 hover:bg-white/[0.04]"
              )}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-2 py-3 border-t border-white/[0.04] space-y-0.5">
        {session ? (
          <>
            <Link
              href="/portfolio"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.04] transition-all duration-150"
            >
              <User className="w-[18px] h-[18px] flex-shrink-0" />
              <span>Portfolio</span>
            </Link>
            {(session.user as { role?: string }).role === "ADMIN" && (
              <Link
                href="/admin"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.04] transition-all duration-150"
              >
                <Shield className="w-[18px] h-[18px] flex-shrink-0" />
                <span>Admin</span>
              </Link>
            )}
            <Link
              href="/settings"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.04] transition-all duration-150"
            >
              <Settings className="w-[18px] h-[18px] flex-shrink-0" />
              <span>Settings</span>
            </Link>
            <button
              onClick={() => { onClose(); signOut(); }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-white/40 hover:text-red-400/80 hover:bg-white/[0.04] transition-all duration-150"
            >
              <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
              <span>Sign out</span>
            </button>
          </>
        ) : (
          <Link
            href="/auth/signin"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.04] transition-all duration-150"
          >
            <User className="w-[18px] h-[18px] flex-shrink-0" />
            <span>Sign in</span>
          </Link>
        )}
      </div>
    </div>
  );
}

// ─── Main AppSidebar ──────────────────────────────────────────────────────────
export function AppSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLanding = pathname === "/";

  // ── Landing page: ultra-minimal floating strip ────────────────────────────
  if (isLanding) {
    return (
      <>
        {/* Floating logo — top-left corner, almost invisible */}
        <div className="fixed left-0 top-0 h-16 w-16 z-50 flex items-center justify-center">
          <Link href="/">
            <Image
              src="/AXISLOGO.png"
              alt="AXIS"
              width={32}
              height={16}
              className="h-4 w-auto object-contain opacity-30 hover:opacity-70 transition-opacity duration-300"
            />
          </Link>
        </div>

        {/* Mobile hamburger (landing) */}
        <button
          className="fixed top-4 right-4 z-50 md:hidden p-2 rounded-lg text-white/30 hover:text-white/70 transition-colors"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile drawer (landing) */}
        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <div className="fixed left-0 top-0 h-screen w-64 z-50 bg-[#09090b] border-r border-white/[0.06] flex flex-col">
              <MobileNav
                pathname={pathname}
                session={session}
                onClose={() => setMobileOpen(false)}
              />
            </div>
          </>
        )}
      </>
    );
  }

  // ── Inner pages: full sidebar ─────────────────────────────────────────────
  const w = collapsed ? "w-16" : "w-60";

  return (
    <>
      {/* Desktop sidebar — fixed */}
      <div
        className={cn(
          "fixed left-0 top-0 h-screen z-40 bg-[#09090b] border-r border-white/[0.06] hidden md:flex flex-col transition-[width] duration-200 ease-out",
          w
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            "flex items-center border-b border-white/[0.04] h-14 px-4 flex-shrink-0",
            collapsed ? "justify-center" : ""
          )}
        >
          <Link href="/">
            <Image
              src="/AXISLOGO.png"
              alt="AXIS"
              width={collapsed ? 20 : 72}
              height={collapsed ? 10 : 36}
              className="h-5 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
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

        {/* Bottom section */}
        <div className="px-2 py-3 border-t border-white/[0.04] space-y-0.5 flex-shrink-0">
          {session ? (
            <>
              <Link
                href="/portfolio"
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
                onClick={() => signOut()}
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

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand" : undefined}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-white/20 hover:text-white/50 hover:bg-white/[0.04] transition-all duration-150",
              collapsed && "justify-center"
            )}
          >
            {collapsed ? (
              <ChevronRight className="w-[18px] h-[18px]" />
            ) : (
              <>
                <ChevronLeft className="w-[18px] h-[18px] flex-shrink-0" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Mobile hamburger (inner pages) */}
      <button
        className="fixed top-3 left-3 z-50 md:hidden p-2 rounded-lg bg-[#09090b]/90 backdrop-blur-sm border border-white/[0.06] text-white/40 hover:text-white/80 transition-colors"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Mobile drawer (inner pages) */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed left-0 top-0 h-screen w-64 z-50 bg-[#09090b] border-r border-white/[0.06] flex flex-col">
            <MobileNav
              pathname={pathname}
              session={session}
              onClose={() => setMobileOpen(false)}
            />
          </div>
        </>
      )}
    </>
  );
}
