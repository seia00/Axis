import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ── Public anon client — safe to use anywhere (RLS-protected) ────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── Admin client — service-role key, bypasses RLS, server-only ───────────────
//
// Lazily initialized so the module can be imported without forcing the
// service-role key into memory. The `import "server-only"` at the top will
// cause a build error if anything in the client bundle tries to import this
// module (Next.js enforces it via the `react-server` condition).
let _supabaseAdmin: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
  if (_supabaseAdmin) return _supabaseAdmin;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set — admin client unavailable");
  }
  _supabaseAdmin = createClient(supabaseUrl, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _supabaseAdmin;
}

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getSupabaseAdmin()[prop as keyof SupabaseClient];
  },
});

// ── File upload — server-only ────────────────────────────────────────────────
const ALLOWED_MIME_PREFIXES = [
  "image/",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument", // docx, xlsx, pptx
  "application/msword",
  "application/vnd.ms-excel",
  "text/plain",
  "text/csv",
];

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

export async function uploadFile(
  bucket: string,
  path: string,
  file: File
): Promise<string> {
  // Validate type and size BEFORE handing to Supabase to avoid wasting
  // bandwidth on rejected uploads. RLS in Supabase should also enforce this
  // server-side; this is defense-in-depth.
  const ok = ALLOWED_MIME_PREFIXES.some(prefix => file.type.startsWith(prefix));
  if (!ok) throw new Error(`Unsupported file type: ${file.type}`);
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(`File too large (max ${MAX_FILE_BYTES / 1024 / 1024} MB)`);
  }

  // Strip path traversal — Supabase normalizes but be paranoid.
  const safePath = path.replace(/\.\.\//g, "").replace(/^\/+/, "");

  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(safePath, file, { upsert: true, contentType: file.type });

  if (error) throw error;

  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(safePath);
  return data.publicUrl;
}
