import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="absolute inset-0 grid-bg opacity-50" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-48 bg-violet-700/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative">
        <Image
          src="/AXISLOGO.png"
          alt="AXIS"
          width={160}
          height={80}
          className="h-10 w-auto object-contain mx-auto mb-10 opacity-60"
        />

        <p className="text-8xl font-bold gradient-text mb-4">404</p>
        <h1 className="text-2xl font-bold tracking-tight mb-3">Page not found</h1>
        <p className="text-[var(--muted-foreground)] max-w-sm mx-auto mb-8">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 btn-primary px-5 py-2.5 text-sm"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <Link
            href="/directory"
            className="inline-flex items-center gap-2 btn-secondary px-5 py-2.5 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Browse Directory
          </Link>
        </div>
      </div>
    </div>
  );
}
