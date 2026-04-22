import Link from "next/link";
import Image from "next/image";

const footerLinks = {
  Platform: [
    { href: "/directory", label: "Directory" },
    { href: "/directory/events", label: "Events" },
    { href: "/network", label: "Network Portal" },
    { href: "/ventures", label: "AXIS Ventures" },
  ],
  Community: [
    { href: "/community", label: "About" },
    { href: "/community/impact", label: "Impact Report" },
    { href: "/community/newsletter", label: "Newsletter" },
    { href: "https://discord.gg/axis", label: "Discord" },
  ],
  Legal: [
    { href: "/legal/privacy", label: "Privacy Policy" },
    { href: "/legal/terms", label: "Terms of Use" },
    { href: "/legal/guidelines", label: "Community Guidelines" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)] mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          <div className="col-span-2">
            <div className="mb-3">
              <Image
                src="/AXISLOGO.png"
                alt="AXIS"
                width={120}
                height={60}
                className="h-10 w-auto object-contain mix-blend-screen opacity-90"
              />
            </div>
            <p className="text-sm text-[var(--muted-foreground)] leading-relaxed max-w-[220px]">
              Infrastructure backbone for Japan's student organization ecosystem. Free for all students, always.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <p className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider mb-3">
                {category}
              </p>
              <ul className="space-y-2">
                {links.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--muted-foreground)]">
            © {new Date().getFullYear()} AXIS. Built by high schoolers, for high schoolers. 🇯🇵
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-[var(--muted-foreground)] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-slow inline-block" />
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
