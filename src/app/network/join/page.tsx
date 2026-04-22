import { Navbar } from "@/components/layout/navbar";
import { OrgRegistrationForm } from "@/components/portal/org-registration-form";
import { Network } from "lucide-react";

export const metadata = { title: "Join the Network" };

export default function JoinNetworkPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex items-center gap-2 mb-2">
          <Network className="w-5 h-5 text-indigo-400" />
          <h1 className="text-2xl font-bold tracking-tight">Register Your Organization</h1>
        </div>
        <p className="text-sm text-[var(--muted-foreground)] mb-8">
          Join the AXIS Network to get listed in the Directory, access the Resource Library, and connect with other student organizations.
        </p>
        <OrgRegistrationForm />
      </main>
    </div>
  );
}
