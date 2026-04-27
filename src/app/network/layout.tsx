import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NetworkSidebar } from "@/components/network/network-sidebar";

export const metadata = { title: "Network Portal" };

export default async function NetworkLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/auth/signin?callbackUrl=/network/dashboard");
  if (session.user.role === "STUDENT") redirect("/network/join");

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
