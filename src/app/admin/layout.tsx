import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { LayoutDashboard, ShieldCheck, Users, BarChart3, Package, MessageSquare, Rocket, CheckSquare } from "lucide-react";

export const metadata = { title: "Admin" };

const sidebarItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/verification", label: "Verification Queue", icon: ShieldCheck },
  { href: "/admin/verify", label: "Verify Items", icon: CheckSquare },
  { href: "/admin/users", label: "User Management", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/reviews", label: "Review Moderation", icon: MessageSquare },
  { href: "/admin/ventures", label: "Ventures", icon: Rocket },
  { href: "/admin/resources", label: "Resources", icon: Package },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex gap-8">
          <Sidebar items={sidebarItems} title="Admin" />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
