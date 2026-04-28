import { Footer } from "@/components/layout/footer";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="min-h-screen">
      <main className="max-w-lg mx-auto px-4 sm:px-6 py-20 text-center">
        <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
        <h1 className="text-2xl font-bold mb-3">Application Submitted!</h1>
        <p className="text-[var(--muted-foreground)] mb-8">
          Thank you for applying to AXIS Ventures. We review all applications within 2 weeks and will be in touch via email.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/directory" className="btn-primary">Browse Directory</Link>
          <Link href="/" className="btn-secondary">Back to Home</Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
