import Link from "next/link";
import Image from "next/image";

const footerLinks = {
  Platform: [
    { href: "/directory",    label: "Directory" },
    { href: "/opportunities", label: "Opportunities" },
    { href: "/launchpad",    label: "Launch Pad" },
    { href: "/match",        label: "AXIS Match" },
    { href: "/ventures",     label: "Ventures" },
    { href: "/resources",    label: "Resources" },
    { href: "/calendar",     label: "Calendar" },
    { href: "/portfolio",    label: "Portfolio" },
  ],
  Community: [
    { href: "/community",         label: "About" },
    { href: "/network",           label: "Network Portal" },
    { href: "/directory/events",  label: "Events" },
    { href: "https://discord.gg/axis", label: "Discord" },
  ],
  Legal: [
    { href: "https://axis-privacy-policy.vercel.app/", label: "Privacy Policy, User Guidelines, Terms of Service" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-transparent mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-10">
          {/* Brand column */}
          <div className="col-span-2">
            <div className="mb-4">
              <Image
                src="/AXISLOGO.png"
                alt="AXIS"
                width={80}
                height={40}
                className="h-7 w-auto object-contain opacity-60"
              />
            </div>
            <p className="text-xs text-white/30 leading-relaxed max-w-[200px]">
              Infrastructure for Japan's student founder ecosystem.
              LinkedIn, Instagram, and Y Combinator — all in one place.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <p className="text-[10px] font-semibold text-white/25 uppercase tracking-[0.18em] mb-4">
                {category}
              </p>
              <ul className="space-y-2.5">
                {links.map(({ href, label }) => {
                  const isExternal = href.startsWith("http");
                  return (
                    <li key={href}>
                      {isExternal ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-white/35 hover:text-white/60 transition-colors duration-150"
                        >
                          {label}
                        </a>
                      ) : (
                        <Link
                          href={href}
                          className="text-xs text-white/35 hover:text-white/60 transition-colors duration-150"
                        >
                          {label}
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-white/20">
            &copy; {new Date().getFullYear()} AXIS. Built by high schoolers, for high schoolers.
          </p>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/70 animate-pulse-slow" />
            <span className="text-[11px] text-white/20">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
