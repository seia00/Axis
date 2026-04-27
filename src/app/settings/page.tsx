"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import {
  User, Shield, Bell, Palette, CheckCircle, Loader2,
  Globe, AtSign,
} from "lucide-react";
import { XIcon, InstagramIcon, LinkedInIcon } from "@/components/ui/brand-icons";

interface ProfileForm {
  bio: string;
  headline: string;
  location: string;
  school: string;
  username: string;
  twitterHandle: string;
  instagramHandle: string;
  linkedinUrl: string;
  websiteUrl: string;
}

const empty: ProfileForm = {
  bio: "", headline: "", location: "", school: "", username: "",
  twitterHandle: "", instagramHandle: "", linkedinUrl: "", websiteUrl: "",
};

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState<ProfileForm>(empty);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin?callbackUrl=/settings");
  }, [status, router]);

  const fetchProfile = useCallback(async () => {
    const res = await fetch("/api/user/profile");
    if (res.ok) {
      const data = await res.json();
      setForm({
        bio: data.bio ?? "",
        headline: data.headline ?? "",
        location: data.location ?? "",
        school: data.school ?? "",
        username: data.username ?? "",
        twitterHandle: data.twitterHandle ?? "",
        instagramHandle: data.instagramHandle ?? "",
        linkedinUrl: data.linkedinUrl ?? "",
        websiteUrl: data.websiteUrl ?? "",
      });
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") fetchProfile();
  }, [status, fetchProfile]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center mt-32">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
        </div>
      </div>
    );
  }

  const set = (key: keyof ProfileForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Settings</h1>
          <p className="text-[var(--muted-foreground)] text-sm">Manage your account and public profile.</p>
        </div>

        {/* Account read-only */}
        <section className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center">
              <User className="w-4 h-4 text-indigo-400" />
            </div>
            <h2 className="font-semibold">Account</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1 block">Name</label>
              <div className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm">
                {session?.user?.name ?? "—"}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1 block">Email</label>
              <div className="px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm">
                {session?.user?.email ?? "—"}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1 block">Role</label>
              <div className="inline-flex px-3 py-1 rounded-full border border-indigo-500/20 bg-indigo-950/20 text-xs font-medium text-indigo-300 capitalize">
                {(session?.user as { role?: string })?.role?.toLowerCase().replace("_", " ") ?? "—"}
              </div>
            </div>
          </div>
        </section>

        {/* Editable profile */}
        <section className="card p-6 space-y-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-violet-600/10 border border-violet-600/20 flex items-center justify-center">
              <AtSign className="w-4 h-4 text-violet-400" />
            </div>
            <h2 className="font-semibold">Public Profile</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1.5 block">Username</label>
              <input
                className="input"
                value={form.username}
                onChange={set("username")}
                placeholder="your-handle"
              />
              <p className="text-[10px] text-[var(--muted-foreground)] mt-1">
                Your public URL: /portfolio/{form.username || "username"}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1.5 block">Headline</label>
              <input className="input" value={form.headline} onChange={set("headline")} placeholder="Student founder · Tokyo" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1.5 block">Bio</label>
            <textarea
              className="input min-h-[88px] resize-y"
              value={form.bio}
              onChange={set("bio")}
              placeholder="Tell your story…"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1.5 block">School</label>
              <input className="input" value={form.school} onChange={set("school")} placeholder="e.g. Keio Senior High School" />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1.5 block">Location</label>
              <input className="input" value={form.location} onChange={set("location")} placeholder="e.g. Tokyo, Japan" />
            </div>
          </div>
        </section>

        {/* Social links */}
        <section className="card p-6 space-y-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-emerald-600/10 border border-emerald-600/20 flex items-center justify-center">
              <Globe className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-semibold">Social Links</h2>
              <p className="text-xs text-[var(--muted-foreground)]">Shown on your public portfolio page</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1.5 flex items-center gap-1.5 block">
                <XIcon className="w-3.5 h-3.5 text-sky-400" /> Twitter / X handle
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] text-sm">@</span>
                <input
                  className="input pl-7"
                  value={form.twitterHandle}
                  onChange={set("twitterHandle")}
                  placeholder="yourhandle"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1.5 flex items-center gap-1.5 block">
                <InstagramIcon className="w-3.5 h-3.5 text-pink-400" /> Instagram handle
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] text-sm">@</span>
                <input
                  className="input pl-7"
                  value={form.instagramHandle}
                  onChange={set("instagramHandle")}
                  placeholder="yourhandle"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1.5 flex items-center gap-1.5 block">
                <LinkedInIcon className="w-3.5 h-3.5 text-blue-400" /> LinkedIn URL
              </label>
              <input
                className="input"
                value={form.linkedinUrl}
                onChange={set("linkedinUrl")}
                placeholder="https://linkedin.com/in/yourname"
                type="url"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1.5 flex items-center gap-1.5 block">
                <Globe className="w-3.5 h-3.5 text-emerald-400" /> Website
              </label>
              <input
                className="input"
                value={form.websiteUrl}
                onChange={set("websiteUrl")}
                placeholder="https://yoursite.com"
                type="url"
              />
            </div>
          </div>
        </section>

        {/* Save */}
        {error && (
          <div className="p-3 rounded-lg border border-red-800/30 bg-red-950/20 text-sm text-red-300">{error}</div>
        )}
        <div className="flex items-center gap-3">
          <Button onClick={handleSave} loading={saving}>Save Changes</Button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-400">
              <CheckCircle className="w-4 h-4" /> Saved
            </span>
          )}
        </div>

        {/* Coming soon placeholders */}
        <div className="grid gap-3">
          {[
            { icon: Shield, label: "Security", desc: "Two-factor authentication, session management" },
            { icon: Bell, label: "Notifications", desc: "Email alerts, browser notifications" },
            { icon: Palette, label: "Appearance", desc: "Themes, font sizes, display preferences" },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="card p-4 flex items-center justify-between opacity-50 cursor-not-allowed">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-[var(--background)] border border-[var(--border)] flex items-center justify-center">
                  <Icon className="w-4 h-4 text-[var(--muted-foreground)]" />
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
