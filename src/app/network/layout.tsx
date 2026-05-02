import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NetworkSidebar } from "@/components/network/network-sidebar";

export const metadata = { title: "Network Portal" };

export default async function NetworkLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  // Only block anonymous users at the layout level. Per-page role/org gating
  // happens inside each child page (dashboard, profile, merge, onboarding all
  // run their own `if (!org) redirect("/network/join")`).
  //
  // Previously this layout also redirected STUDENT users to /network/join —
  // but /network/join itself is wrapped by this same layout, so STUDENT
  // visitors got an infinite redirect loop and Next.js rendered a blank page.
  if (!session) redirect("/auth/signin?callbackUrl=/network/dashboard");

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-8">
          <NetworkSidebar />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
