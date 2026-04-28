import { Footer } from "@/components/layout/footer";
import { VentureApplicationForm } from "@/components/ventures/application-form";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export const metadata = { title: "Apply to AXIS Ventures" };

export default async function VentureApplyPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen">
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-2">Apply to AXIS Ventures</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Tell us about your initiative. We review all applications within 2 weeks.
          </p>
        </div>

        {session ? (
          <VentureApplicationForm />
        ) : (
          <div className="card text-center p-10">
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              You need a free AXIS account to apply.
            </p>
            <Link href="/auth/signin?callbackUrl=/ventures/apply" className="btn-primary">
              Sign in to Apply
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
