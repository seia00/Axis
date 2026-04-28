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
      {/* ── Fixed top bar — mobile only ─────────────────────────────────── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-[#09090b]/95 backdrop-blur-md border-b border-white/[0.06] flex items-center justify-between px-4">
        <Link href="/" onClick={close}>
          <Image
            src="/AXISLOGO.png"
            alt="AXIS"
            width={72}
            height={36}
            className="h-5 w-auto object-contain opacity-80"
            priority
          />
        </Link>
        <button
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
          className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.06] transition-all duration-150"
        >
          {open ? <X className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </header>

      {/* ── Dropdown panel ──────────────────────────────────────────────── */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={close}
          />

          {/* Panel */}
          <div className="md:hidden fixed top-14 left-0 right-0 z-40 bg-[#09090b] border-b border-white/[0.06] shadow-2xl overflow-y-auto max-h-[calc(100vh-3.5rem)]">

            {/* Main nav — 2-column grid */}
            <nav className="px-3 pt-3 pb-2 grid grid-cols-2 gap-1">
              {navItems.map(({ href, labelKey, icon: Icon }) => {
                const active = pathname?.startsWith(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={close}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2.5 text-sm rounded-lg transition-all duration-150",
                      active
                        ? "text-white bg-white/[0.08]"
                        : "text-white/50 hover:text-white hover:bg-white/[0.04]"
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{t(labelKey)}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Account + language */}
            <div className="border-t border-white/[0.05] px-3 py-3 space-y-0.5">
              {session ? (
                <>
                  <Link
                    href="/portfolio"
                    onClick={close}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-white/50 hover:text-white hover:bg-white/[0.04] transition-all duration-150"
                  >
                    <User className="w-4 h-4 flex-shrink-0" />
                    <span>{t("nav.portfolio")}</span>
                  </Link>

                  {(session.user as { role?: string }).role === "ADMIN" && (
                    <Link
                      href="/admin"
                      onClick={close}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-white/50 hover:text-white hover:bg-white/[0.04] transition-all duration-150"
                    >
                      <Shield className="w-4 h-4 flex-shrink-0" />
                      <span>{t("nav.admin")}</span>
                    </Link>
                  )}

                  <Link
                    href="/settings"
                    onClick={close}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-white/50 hover:text-white hover:bg-white/[0.04] transition-all duration-150"
                  >
                    <Settings className="w-4 h-4 flex-shrink-0" />
                    <span>{t("nav.settings")}</span>
                  </Link>

                  <button
                    onClick={() => { close(); signOut(); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-white/50 hover:text-red-400 hover:bg-white/[0.04] transition-all duration-150"
                  >
                    <LogOut className="w-4 h-4 flex-shrink-0" />
                    <span>{t("nav.signout")}</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/signin"
                  onClick={close}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-white/50 hover:text-white hover:bg-white/[0.04] transition-all duration-150"
                >
                  <User className="w-4 h-4 flex-shrink-0" />
                  <span>{t("nav.signin")}</span>
                </Link>
              )}

              {/* Language toggle */}
              <button
                onClick={toggle}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all duration-150 mt-1"
              >
                <span className="text-base leading-none">{lang === "en" ? "🇯🇵" : "🇬🇧"}</span>
                <span>{lang === "en" ? "日本語" : "English"}</span>
              </button>
            </div>

          </div>
        </>
      )}
    </>
  );
}
