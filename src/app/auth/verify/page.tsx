import { Mail } from "lucide-react";
import Link from "next/link";

export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 rounded-full bg-indigo-950 border border-indigo-800/40 flex items-center justify-center mx-auto mb-6">
          <Mail className="w-7 h-7 text-indigo-400" />
        </div>
        <h1 className="text-xl font-semibold mb-2">Check your inbox</h1>
        <p className="text-sm text-[var(--muted-foreground)] mb-6">
          A sign-in link has been sent to your email address. Click it to complete sign-in.
          <br /><br />
          The link expires in 24 hours.
        </p>
        <Link href="/" className="text-sm text-indigo-400 hover:text-indigo-300">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
