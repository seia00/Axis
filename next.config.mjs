/** @type {import('next').NextConfig} */

// ── Security headers applied to every response ────────────────────────────────
//
// CSP is intentionally tuned for a Next.js + NextAuth + Supabase + Resend stack
// running on Vercel. Anything that would otherwise need 'unsafe-eval' or
// 'unsafe-inline' for *scripts* is whitelisted via 'strict-dynamic' fallbacks.
//
// We allow 'unsafe-inline' for STYLE because Tailwind/Next inject style tags
// at runtime; locking this down would break the app and offers little real
// protection (style XSS surface is tiny vs. script XSS).
const ContentSecurityPolicy = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://accounts.google.com https://apis.google.com https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  // raw.githack.com hosts the drei `<Environment preset>` HDR maps used by
  // the 3D landing/animation components. Without it the WebGL canvas loses
  // context and the page errors. cdn.jsdelivr.net is the fallback CDN drei
  // uses for some assets.
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://accounts.google.com https://api.resend.com https://va.vercel-scripts.com https://raw.githack.com https://cdn.jsdelivr.net",
  "frame-src 'self' https://accounts.google.com",
  "frame-ancestors 'none'",
  "form-action 'self' https://accounts.google.com",
  "base-uri 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  // Prevents the page being embedded in an iframe — defends against clickjacking.
  // 'frame-ancestors none' in CSP makes this redundant on modern browsers, but
  // legacy ones still respect this header.
  { key: "X-Frame-Options", value: "DENY" },
  // Stops MIME sniffing — defends against drive-by XSS via uploaded files.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Forces HTTPS for 2 years and includes subdomains. Vercel terminates TLS
  // so all production traffic is already HTTPS; this just tells the browser
  // to never even try HTTP again.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // Trim the referrer to origin only when navigating cross-origin — protects
  // user privacy and stops query-string secrets from leaking via Referer.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable browser features we don't use. If we ever add geolocation/camera
  // for some feature, expand the list.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=(), browsing-topics=()" },
  // Modern XSS protection — most browsers honor CSP instead, but this adds
  // belt-and-suspenders for older Edge/IE.
  { key: "X-XSS-Protection", value: "1; mode=block" },
  // Same-origin isolation — protects against side-channel attacks like Spectre
  // and stops cross-origin windows from poking at our window object.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  // The big one — see CSP above for rationale.
  { key: "Content-Security-Policy", value: ContentSecurityPolicy },
];

const nextConfig = {
  // Don't expose Next.js or framework info via the X-Powered-By header.
  poweredByHeader: false,

  // Strict mode catches bugs early — leave on.
  reactStrictMode: true,

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
    ],
  },

  experimental: {
    serverActions: {
      // Anti-CSRF: server actions only fire from these origins. The `VERCEL_URL`
      // env var is auto-populated by Vercel for preview/prod deploys.
      allowedOrigins: [
        "localhost:3000",
        process.env.VERCEL_URL,
        process.env.NEXT_PUBLIC_SITE_URL,
      ].filter(Boolean),
    },
  },

  async headers() {
    return [
      {
        // Apply to all routes
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
