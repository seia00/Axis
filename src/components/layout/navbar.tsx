"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  LayoutGrid,
  Network,
  Rocket,
  Info,
  ChevronDown,
  LogOut,
  Settings,
  Shield,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const navLinks = [
  { href: "/directory", label: "Directory", icon: LayoutGrid },
  { href: "/network", label: "Network", icon: Network },
  { href: "/ventures", label: "Ventures", icon: Rocket },
  { href: "/community", label: "Community", icon: Info },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0 group">
            <Image
              src="/AXISLOGO.png"
              alt="AXIS"
              width={96}
              height={48}
              className="h-8 w-auto object-contain transition-all duration-300 group-hover:drop-shadow-[0_0_12px_rgba(139,92,246,0.7)]"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-lg transition-colors",
                  pathname?.startsWith(href)
                    ? "bg-[var(--surface-raised)] text-[var(--foreground)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-raised)]"
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[var(--surface-raised)] transition-colors"
                >
                  <Avatar src={session.user.image} name={session.user.name} size="xs" />
                  <span className="hidden sm:block text-sm text-[var(--foreground)] max-w-[120px] truncate">
                    {session.user.name ?? session.user.email}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-[var(--border)] bg-[var(--surface-raised)] shadow-xl z-20 py-1">
                      <div className="px-3 py-2 border-b border-[var(--border)]">
                        <p className="text-xs font-medium text-[var(--foreground)] truncate">{session.user.email}</p>
                        <p className="text-xs text-[var(--muted-foreground)] capitalize">{session.user.role.toLowerCase().replace("_", " ")}</p>
                      </div>
                      {session.user.role === "ORG_LEADER" && (
                        <Link
                          href="/network/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-overlay)] transition-colors"
                        >
                          <Network className="w-4 h-4" />
                          Network Portal
                        </Link>
                      )}
                      {session.user.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-overlay)] transition-colors"
                        >
                          <Shield className="w-4 h-4" />
                          Admin Panel
                        </Link>
                      )}
                      <Link
                        href="/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-overlay)] transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </Link>
                      <button
                        onClick={() => { setUserMenuOpen(false); signOut(); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--muted-foreground)] hover:text-red-400 hover:bg-[var(--surface-overlay)] transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/signin">
                  <Button variant="ghost" size="sm">Sign in</Button>
                </Link>
                <Link href="/auth/signin">
                  <Button size="sm">Join AXIS</Button>
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-1.5 rounded-lg hover:bg-[var(--surface-raised)] text-[var(--muted-foreground)]"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {menuOpen && (
          <div className="md:hidden border-t border-[var(--border)] py-3 space-y-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors",
                  pathname?.startsWith(href)
                    ? "bg-[var(--surface-raised)] text-[var(--foreground)]"
                    : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
