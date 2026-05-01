// ─── Security utilities ───────────────────────────────────────────────────────
//
// Centralized helpers for input sanitization, error handling, and rate
// limiting. Use these in API routes instead of rolling your own — they're
// the only path tested against the threats we care about.

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

// ─── URL sanitization ─────────────────────────────────────────────────────────

/**
 * Returns the URL only if it's safe — http/https with a valid host. Anything
 * else (javascript:, data:, file:, vbscript:, malformed) returns null.
 *
 * Use for ALL user-submitted URLs that get stored or rendered. The classic
 * attack is `javascript:alert(1)` in an `<a href>` field.
 */
export function sanitizeUrl(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  // Hard-reject dangerous schemes before parsing — some parsers normalize them.
  if (/^(javascript|data|vbscript|file):/i.test(trimmed)) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

/**
 * Like `sanitizeUrl` but only allows specific hostnames (e.g. trusted CDNs).
 * Use for download redirects to prevent open-redirect attacks.
 */
export function sanitizeUrlOnHosts(input: unknown, allowedHosts: string[]): string | null {
  const safe = sanitizeUrl(input);
  if (!safe) return null;
  try {
    const host = new URL(safe).hostname;
    const ok = allowedHosts.some(allowed =>
      host === allowed || host.endsWith(`.${allowed}`)
    );
    return ok ? safe : null;
  } catch {
    return null;
  }
}

// ─── HTML escaping ────────────────────────────────────────────────────────────

/**
 * Minimal HTML escape for use in email templates and other server-rendered
 * HTML where user-controlled strings get interpolated. Don't use this for
 * React render output — React already escapes by default.
 */
export function escapeHtml(input: unknown): string {
  if (input == null) return "";
  return String(input)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ─── CSV cell sanitization ────────────────────────────────────────────────────

/**
 * Escape a value for inclusion in a CSV cell. Critical defense against CSV
 * injection — Excel/Sheets evaluate cells starting with =, +, -, @ as
 * formulas, which can exfiltrate data via `=HYPERLINK(...)` or run macros.
 *
 * Wraps the value in quotes and prefixes with a single quote if it starts
 * with a dangerous character.
 */
export function csvCell(input: unknown): string {
  let s = input == null ? "" : String(input);
  // Prevent formula injection
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  // Escape internal quotes by doubling them, then wrap
  s = s.replace(/"/g, '""');
  return `"${s}"`;
}

// ─── Auth guards ──────────────────────────────────────────────────────────────

/**
 * Returns the session if the user is signed in, else returns a 401 Response
 * (you should `return` it from your handler). Tightens type so the caller
 * gets `session.user.id` non-null.
 */
export async function requireSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session, error: null as null };
}

/**
 * Like `requireSession` but also requires ADMIN role.
 */
export async function requireAdmin() {
  const { session, error } = await requireSession();
  if (error) return { session: null, error };
  if (session.user.role !== "ADMIN") {
    return { session: null, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session, error: null as null };
}

// ─── Safe error responses ─────────────────────────────────────────────────────

/**
 * Convert any thrown error into a generic 500 Response that does NOT leak
 * the underlying error message — Prisma especially loves to dump connection
 * strings, table names, and constraint details. In dev we still log to the
 * server console so you can debug.
 */
export function safeError(err: unknown, fallback = "Internal server error"): NextResponse {
  if (process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.error("[safeError]", err);
  }
  return NextResponse.json({ error: fallback }, { status: 500 });
}

// ─── Rate limiting ────────────────────────────────────────────────────────────

// In-memory token-bucket store. Sufficient for a single-region serverless
// deploy under moderate traffic. For multi-region or high-traffic, swap for
// Redis (Upstash). Bucket key is `${kind}:${ip-or-userid}`.
const buckets = new Map<string, { count: number; resetAt: number }>();

// Lazy janitor — clear expired buckets when the map grows past a threshold.
// Avoids a long-running setInterval (problematic in serverless cold starts).
function maybeCleanup() {
  if (buckets.size < 5000) return;
  const now = Date.now();
  // forEach avoids needing downlevelIteration in older TS targets
  buckets.forEach((b, key) => {
    if (b.resetAt < now) buckets.delete(key);
  });
}

/**
 * Returns the client IP from request headers. In production behind Vercel
 * the canonical source is `x-forwarded-for` (first entry).
 *
 * NOTE: In a malicious environment, `x-forwarded-for` is spoofable if the
 * caller bypasses the edge — but Vercel rewrites it to the true edge IP, so
 * trust it for rate limiting (not for any kind of auth).
 */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]?.trim() ?? "unknown";
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

/**
 * Apply a rate limit. Returns null if the request is allowed, or a 429
 * Response if rate-limited.
 *
 * @param req     The incoming request (used to derive the client identifier)
 * @param kind    A string identifier for the bucket (so different endpoints don't share)
 * @param max     Max requests per window
 * @param windowMs Window length in milliseconds
 * @param userId  Optional user id — uses this instead of IP when present (per-user limit)
 */
export function rateLimit(
  req: Request,
  kind: string,
  max: number,
  windowMs: number,
  userId?: string,
): NextResponse | null {
  maybeCleanup();
  const id = userId ?? clientIp(req);
  const key = `${kind}:${id}`;
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (bucket.count >= max) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      {
        status: 429,
        headers: {
          "Retry-After": String(retryAfter),
          "X-RateLimit-Limit": String(max),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(Math.ceil(bucket.resetAt / 1000)),
        },
      },
    );
  }

  bucket.count += 1;
  return null;
}

// ─── String validation ────────────────────────────────────────────────────────

/**
 * Trim, length-cap, and strip null-bytes from a user-submitted string. Use
 * this on any text that gets stored — protects against DB blowups and
 * sneaky null-byte injection in old DB drivers.
 */
export function safeString(input: unknown, maxLen: number): string {
  if (typeof input !== "string") return "";
  return input.replace(/\0/g, "").trim().slice(0, maxLen);
}
