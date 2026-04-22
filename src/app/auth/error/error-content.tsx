"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, string> = {
    Configuration: "There is a problem with the server configuration.",
    AccessDenied: "You do not have permission to sign in.",
    Verification: "The sign in link is no longer valid.",
    Default: "An error occurred during sign in.",
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h1 className="text-xl font-semibold mb-2">Sign in error</h1>
        <p className="text-sm text-[var(--muted-foreground)] mb-6">
          {errorMessages[error ?? "Default"] ?? errorMessages.Default}
        </p>
        <Link href="/auth/signin" className="btn-primary">
          Try again
        </Link>
      </div>
    </div>
  );
}
