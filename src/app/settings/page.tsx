import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { User, Shield, Bell, Palette, Globe } from "lucide-react";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/signin?callbackUrl=/settings");

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Settings</h1>
          <p className="text-[var(--muted-foreground)]">Manage your account and preferences.</p>
        </div>

        <div className="grid gap-6">
          {/* Profile Section */}
          <section className="card p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center">
                <User className="w-5 h-5 text-indigo-400" />
              </div>
              <h2 className="text-xl font-semibold">Account Profile</h2>
            </div>
            
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1 block">Full Name</label>
                  <div className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm">
                    {session.user.name || "Not set"}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1 block">Email Address</label>
                  <div className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm">
                    {session.user.email}
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1 block">Role</label>
                <div className="inline-flex px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-950/20 text-xs font-medium text-indigo-300 capitalize">
                  {session.user.role.toLowerCase().replace("_", " ")}
                </div>
              </div>
            </div>
          </section>

          {/* Other Categories (Placeholders) */}
          {[
            { icon: Shield, label: "Security", desc: "Two-factor authentication, password management" },
            { icon: Bell, label: "Notifications", desc: "Email alerts, browser notifications" },
            { icon: Palette, label: "Appearance", desc: "Themes, font sizes, display preferences" },
            { icon: Globe, label: "Language", desc: "Select your preferred language" },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="card p-4 flex items-center justify-between group cursor-not-allowed opacity-60">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[var(--background)] border border-[var(--border)] flex items-center justify-center">
                  <Icon className="w-5 h-5 text-[var(--muted-foreground)]" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">{label}</h3>
                  <p className="text-xs text-[var(--muted-foreground)]">{desc}</p>
                </div>
              </div>
              <span className="text-[10px] font-medium bg-[var(--surface-overlay)] px-2 py-1 rounded border border-[var(--border)] text-[var(--muted-foreground)]">
                Coming Soon
              </span>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
