"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  ChevronDown,
  X,
  User,
  Shield,
  Settings,
  LogOut,
  LayoutGrid,
  Users,
  Briefcase,
  Rocket,
  TrendingUp,
  Sparkles,
  Calendar,
  BookOpen,
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

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const { lang, toggle, t } = useLanguage();

  const close = () => setOpen(false);

  return (
    <>
      {/* ── Fixed top bar ───────────────────────────────────────────────── */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-50 h-12 flex items-center justify-between px-4"
        style={{
          background: "rgba(5,2,11,0.95)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Link href="/" onClick={close}>
          <Image
            src="/AXISLOGO.png" alt="AXIS" width={64} height={32}
            className="h-4 w-auto object-contain opacity-75"
            priority
          />
        </Link>
        <button
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
          className="p-1.5 text-white/40 hover:text-white hover:bg-white/[0.06] transition-all"
          style={{ borderRadius: "3px" }}
        >
          {open
            ? <X style={{ width: 16, height: 16 }} />
            : <ChevronDown style={{ width: 16, height: 16 }} />
          }
        </button>
      </header>

      {/* ── Dropdown panel ──────────────────────────────────────────────── */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/60"
            onClick={close}
            style={{ backdropFilter: "blur(4px)" }}
          />

          {/* Panel */}
          <div
            className="md:hidden fixed top-12 left-0 right-0 z-40 overflow-y-auto"
            style={{
              background: "#05020b",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
              maxHeight: "calc(100vh - 3rem)",
            }}
          >
            {/* Nav grid — 2 columns */}
            <nav className="px-2 pt-2 pb-1 grid grid-cols-2 gap-px">
              {navItems.map(({ href, labelKey, icon: Icon }) => {
                const active = pathname?.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={close}
                    className={cn(
                      "relative flex items-center gap-2 px-3 py-2 text-[13px] font-medium transition-colors duration-100",
                      active
                        ? "text-white bg-violet-500/[0.08]"
                        : "text-white/40 hover:text-white/70 hover:bg-white/[0.03]"
                    )}
                    style={{ borderRadius: "3px" }}
                  >
                    {active && (
                      <span
                        className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-violet-500"
                        style={{ borderRadius: "0 1px 1px 0" }}
                      />
                    )}
                    <Icon
                      className={active ? "text-violet-400" : "text-current"}
                      style={{ width: 14, height: 14, flexShrink: 0 }}
                    />
                    <span className="truncate">{t(labelKey)}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Account + language */}
            <div
              className="px-2 py-2 space-y-px"
              style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
            >
              {session ? (
                <>
                  <Link href="/portfolio" onClick={close}
                    className="flex items-center gap-2 px-3 py-2 text-[13px] text-white/40 hover:text-white/70 hover:bg-white/[0.03] transition-colors"
                    style={{ borderRadius: "3px" }}>
                    <User style={{ width: 14, height: 14 }} className="flex-shrink-0" />
                    <span>{t("nav.portfolio")}</span>
                  </Link>

                  {(session.user as { role?: string }).role === "ADMIN" && (
                    <Link href="/admin" onClick={close}
                      className="flex items-center gap-2 px-3 py-2 text-[13px] text-white/40 hover:text-white/70 hover:bg-white/[0.03] transition-colors"
                      style={{ borderRadius: "3px" }}>
                      <Shield style={{ width: 14, height: 14 }} className="flex-shrink-0" />
                      <span>{t("nav.admin")}</span>
                    </Link>
                  )}

                  <Link href="/settings" onClick={close}
                    className="flex items-center gap-2 px-3 py-2 text-[13px] text-white/40 hover:text-white/70 hover:bg-white/[0.03] transition-colors"
                    style={{ borderRadius: "3px" }}>
                    <Settings style={{ width: 14, height: 14 }} className="flex-shrink-0" />
                    <span>{t("nav.settings")}</span>
                  </Link>

                  <button
                    onClick={() => { close(); signOut(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-white/40 hover:text-red-400/70 hover:bg-white/[0.03] transition-colors"
                    style={{ borderRadius: "3px" }}>
                    <LogOut style={{ width: 14, height: 14 }} className="flex-shrink-0" />
                    <span>{t("nav.signout")}</span>
                  </button>
                </>
              ) : (
                <Link href="/auth/signin" onClick={close}
                  className="flex items-center gap-2 px-3 py-2 text-[13px] text-white/40 hover:text-white/70 hover:bg-white/[0.03] transition-colors"
                  style={{ borderRadius: "3px" }}>
                  <User style={{ width: 14, height: 14 }} className="flex-shrink-0" />
                  <span>{t("nav.signin")}</span>
                </Link>
              )}

              {/* Language toggle */}
              <button
                onClick={toggle}
                className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-white/25 hover:text-white/50 hover:bg-white/[0.03] transition-colors font-mono"
                style={{ borderRadius: "3px" }}
              >
                <span className="text-[13px] leading-none">{lang === "en" ? "🇯🇵" : "🇬🇧"}</span>
                <span>{lang === "en" ? "日本語" : "English"}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
