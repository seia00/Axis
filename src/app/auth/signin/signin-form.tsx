"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function SignInForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [email, setEmail] = useState("");
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleEmailSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingEmail(true);
    try {
      await signIn("email", { email, callbackUrl, redirect: false });
      setEmailSent(true);
    } finally {
      setLoadingEmail(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--background)]">
      <div className="w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-xs">AX</span>
          </div>
          <span className="font-semibold">AXIS</span>
        </Link>

        <div className="card">
          {emailSent ? (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
              <h2 className="font-semibold mb-2">Check your email</h2>
              <p className="text-sm text-[var(--muted-foreground)]">
                We sent a sign-in link to <strong>{email}</strong>. Click it to sign in.
                <br /><br />
                The link expires in 24 hours.
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-lg font-semibold mb-1 text-center">Sign in to AXIS</h1>
              <p className="text-xs text-[var(--muted-foreground)] text-center mb-6">
                Free for all students. Always.
              </p>

              <Button
                variant="secondary"
                className="w-full gap-3 mb-4"
                onClick={() => { setLoadingGoogle(true); signIn("google", { callbackUrl }); }}
                loading={loadingGoogle}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-[var(--border)]" />
                <span className="text-xs text-[var(--muted-foreground)]">or</span>
                <div className="flex-1 h-px bg-[var(--border)]" />
              </div>

              <form onSubmit={handleEmailSignin} className="space-y-3">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  label="Email address"
                />
                <Button type="submit" className="w-full" loading={loadingEmail}>
                  Continue with Email
                </Button>
              </form>

              <p className="text-xs text-[var(--muted-foreground)] text-center mt-4">
                By signing in, you agree to our{" "}
                <Link href="/legal/terms" className="text-indigo-400 hover:underline">Terms</Link>
                {" "}and{" "}
                <Link href="/legal/privacy" className="text-indigo-400 hover:underline">Privacy Policy</Link>.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
