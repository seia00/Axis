import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { LayoutDashboard, Edit, Package, GitMerge, Users, GraduationCap } from "lucide-react";

export const metadata = { title: "Network Portal" };

const sidebarItems = [
  { href: "/network/dashboard", label: "Dashboard",  icon: LayoutDashboard },
  { href: "/network/profile",   label: "Edit Profile", icon: Edit },
  { href: "/network/team",      label: "Team",         icon: Users },
  { href: "/network/resources", label: "Resources",    icon: Package },
  { href: "/network/merge",     label: "Merge Program", icon: GitMerge },
  { href: "/network/onboarding",label: "Onboarding",   icon: GraduationCap },
];

export default async function NetworkLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/auth/signin?callbackUrl=/network/dashboard");
  if (session.user.role === "STUDENT") redirect("/network/join");

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-8">
          <Sidebar items={sidebarItems} title="Network Portal" />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
