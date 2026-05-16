"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import {
  User, Shield, Bell, Palette, CheckCircle, Loader2,
  Globe, AtSign, CreditCard, BookOpen, Plus, X, Sparkles,
} from "lucide-react";
import { XIcon, InstagramIcon, LinkedInIcon } from "@/components/ui/brand-icons";

interface Extracurricular {
  name: string;
  elaboration: string;
}

interface ProfileForm {
  name: string;
  bio: string;
  headline: string;
  location: string;
  school: string;
  username: string;
  age: string;          // stored as string for input; converted to number on save
  country: string;
  prefecture: string;
  twitterHandle: string;
  instagramHandle: string;
  linkedinUrl: string;
  websiteUrl: string;
}

const empty: ProfileForm = {
  name: "", bio: "", headline: "", location: "", school: "", username: "",
  age: "", country: "", prefecture: "",
  twitterHandle: "", instagramHandle: "", linkedinUrl: "", websiteUrl: "",
};

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState<ProfileForm>(empty);
  const [ecs, setEcs] = useState<Extracurricular[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [skills,    setSkills   ] = useState<string[]>([]);
  const [goals,     setGoals    ] = useState<string[]>([]);
  const [interestDraft, setInterestDraft] = useState("");
  const [skillDraft,    setSkillDraft   ] = useState("");
  const [goalDraft,     setGoalDraft    ] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [billing, setBilling] = useState({
    subscriptionStatus: "inactive",
    priceId: null as string | null,
    currentPeriodEnd: null as string | null,
  });
  const [billingLoading, setBillingLoading] = useState<"checkout" | "portal" | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin?callbackUrl=/settings");
  }, [status, router]);

  const fetchProfile = useCallback(async () => {
    const res = await fetch("/api/user/profile");
    if (res.ok) {
      const data = await res.json();
      setForm({
        name: data.name ?? "",
        bio: data.bio ?? "",
        headline: data.headline ?? "",
        location: data.location ?? "",
        school: data.school ?? "",
        username: data.username ?? "",
        age: data.age != null ? String(data.age) : "",
        country: data.country ?? "",
        prefecture: data.prefecture ?? "",
        twitterHandle: data.twitterHandle ?? "",
        instagramHandle: data.instagramHandle ?? "",
        linkedinUrl: data.linkedinUrl ?? "",
        websiteUrl: data.websiteUrl ?? "",
      });
      if (Array.isArray(data.extracurriculars)) {
        setEcs(data.extracurriculars.map((ec: { name?: string; elaboration?: string }) => ({
          name: ec.name ?? "",
          elaboration: ec.elaboration ?? "",
        })));
      }
      if (Array.isArray(data.interests)) setInterests(data.interests);
      if (Array.isArray(data.skills))    setSkills(data.skills);
      if (Array.isArray(data.goals))     setGoals(data.goals);
      setBilling({
        subscriptionStatus: data.subscriptionStatus ?? "inactive",
        priceId: data.priceId ?? null,
        currentPeriodEnd: data.currentPeriodEnd ?? null,
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
      const parsedAge = form.age.trim() !== "" ? parseInt(form.age.trim(), 10) : null;
      // Build payload explicitly — avoids any spread ordering ambiguity
      const payload: Record<string, unknown> = {
        name:            form.name,
        bio:             form.bio,
        headline:        form.headline,
        location:        form.location,
        school:          form.school,
        username:        form.username,
        age:             Number.isFinite(parsedAge) ? parsedAge : null,
        country:         form.country,
        prefecture:      form.prefecture,
        twitterHandle:   form.twitterHandle,
        instagramHandle: form.instagramHandle,
        linkedinUrl:     form.linkedinUrl,   // empty string → null handled in API
        websiteUrl:      form.websiteUrl,    // empty string → null handled in API
        extracurriculars: ecs.filter(e => e.name.trim()).map(e => ({
          name: e.name.trim(),
          elaboration: e.elaboration.trim() || undefined,
        })),
        interests: interests.filter(Boolean),
        skills:    skills.filter(Boolean),
        goals:     goals.filter(Boolean),
      };

      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers:  { "Content-Type": "application/json" },
        body:     JSON.stringify(payload),
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

  const openBilling = async (kind: "checkout" | "portal") => {
    setBillingLoading(kind);
    setError("");
    try {
      const res = await fetch(`/api/billing/${kind}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error ?? "Unable to open billing");
      window.location.href = data.url;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unable to open billing");
    } finally {
      setBillingLoading(null);
    }
  };

  // Tag-input helpers
  const addTag = (
    list: string[], setList: (v: string[]) => void,
    draft: string, setDraft: (v: string) => void,
    max = 30,
  ) => {
    const val = draft.trim();
    if (!val || list.includes(val) || list.length >= max) return;
    setList([...list, val]);
    setDraft("");
  };
  const removeTag = (list: string[], setList: (v: string[]) => void, idx: number) =>
    setList(list.filter((_, i) => i !== idx));

  const addEc = () => setEcs(prev => [...prev, { name: "", elaboration: "" }]);
  const removeEc = (i: number) => setEcs(prev => prev.filter((_, j) => j !== i));
  const updateEc = (i: number, field: keyof Extracurricular, value: string) =>
    setEcs(prev => prev.map((ec, j) => j === i ? { ...ec, [field]: value } : ec));

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
      </div>
    );
  }

  const set = (key: keyof ProfileForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value }));

  const isPaid = billing.subscriptionStatus === "active" || billing.subscriptionStatus === "trialing";

  return (
    <div className="min-h-screen">
      <main className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Settings</h1>
          <p className="text-[var(--muted-foreground)] text-sm">Manage your account and public profile.</p>
        </div>

        {/* ── Account ──────────────────────────────────────────────── */}
        <section className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-indigo-600/10 border border-indigo-600/20 flex items-center justify-center">
              <User className="w-4 h-4 text-indigo-400" />
            </div>
            <h2 className="font-semibold">Account</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1.5 block">
                Name <span className="text-violet-400">✱</span>
              </label>
              <input
                className="settings-input"
                value={form.name}
                onChange={set("name")}
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1 block">Email</label>
              <div className="px-3 py-2 rounded-[3px] border border-white/[0.08] bg-white/[0.03] text-sm text-white/50">
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

        {/* ── Billing ──────────────────────────────────────────────── */}
        <section className="card p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-cyan-600/10 border border-cyan-600/20 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h2 className="font-semibold">Billing</h2>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                  Status: <span className="capitalize text-[var(--foreground)]">{billing.subscriptionStatus.replace("_", " ")}</span>
                  {billing.currentPeriodEnd && (
                    <> · Renews {new Date(billing.currentPeriodEnd).toLocaleDateString()}</>
                  )}
                </p>
              </div>
            </div>
            {isPaid ? (
              <Button variant="secondary" onClick={() => openBilling("portal")} loading={billingLoading === "portal"}>
                Manage subscription
              </Button>
            ) : (
              <Button onClick={() => openBilling("checkout")} loading={billingLoading === "checkout"}>
                Upgrade / Subscribe
              </Button>
            )}
          </div>
        </section>

        {/* ── About You ────────────────────────────────────────────── */}
        <section className="card p-6 space-y-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-amber-600/10 border border-amber-600/20 flex items-center justify-center">
              <User className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="font-semibold">About You</h2>
              <p className="text-xs text-[var(--muted-foreground)]">Helps personalise your experience — all optional</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1.5 block">Age</label>
              <input
                className="settings-input"
                type="number"
                min={10}
                max={100}
                value={form.age}
                onChange={set("age")}
                placeholder="e.g. 17"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1.5 block">Country</label>
              <input
                className="settings-input"
                value={form.country}
                onChange={set("country")}
                placeholder="e.g. Japan"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1.5 block">Prefecture / Region</label>
              <input
                className="settings-input"
                value={form.prefecture}
                onChange={set("prefecture")}
                placeholder="e.g. Tokyo"
              />
            </div>
          </div>
        </section>

        {/* ── Extracurriculars ─────────────────────────────────────── */}
        <section className="card p-6 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-rose-600/10 border border-rose-600/20 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-rose-400" />
              </div>
              <div>
                <h2 className="font-semibold">Extracurriculars</h2>
                <p className="text-xs text-[var(--muted-foreground)]">Add activities, clubs, sports — elaboration is optional</p>
              </div>
            </div>
            <button
              type="button"
              onClick={addEc}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-violet-400 hover:text-violet-300 border border-violet-500/20 hover:border-violet-500/40 rounded-[3px] transition-colors bg-violet-950/20 hover:bg-violet-950/30"
            >
              <Plus className="w-3.5 h-3.5" /> Add EC
            </button>
          </div>

          {ecs.length === 0 && (
            <p className="text-xs text-white/20 py-2">No extracurriculars added yet.</p>
          )}

          <div className="space-y-2">
            {ecs.map((ec, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="flex-1 grid sm:grid-cols-2 gap-2">
                  <input
                    className="settings-input"
                    value={ec.name}
                    onChange={e => updateEc(i, "name", e.target.value)}
                    placeholder="Activity name (e.g. Debate)"
                  />
                  <input
                    className="settings-input"
                    value={ec.elaboration}
                    onChange={e => updateEc(i, "elaboration", e.target.value)}
                    placeholder="Details, awards, roles… (optional)"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeEc(i)}
                  className="mt-0.5 p-1.5 text-white/20 hover:text-red-400/70 hover:bg-white/[0.04] rounded-[3px] transition-colors flex-shrink-0"
                  aria-label="Remove"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ── Interests, Skills & Goals ────────────────────────────── */}
        <section className="card p-6 space-y-5">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-violet-600/10 border border-violet-600/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <h2 className="font-semibold">Interests, Skills &amp; Goals</h2>
              <p className="text-xs text-[var(--muted-foreground)]">Helps AI Match surface the right opportunities and people for you</p>
            </div>
          </div>

          {(
            [
              { label: "Interests", placeholder: "e.g. Entrepreneurship", list: interests, setList: setInterests, draft: interestDraft, setDraft: setInterestDraft },
              { label: "Skills",    placeholder: "e.g. React, Marketing",  list: skills,    setList: setSkills,    draft: skillDraft,    setDraft: setSkillDraft    },
              { label: "Goals",     placeholder: "e.g. Start a company",   list: goals,     setList: setGoals,     draft: goalDraft,     setDraft: setGoalDraft     },
            ] as Array<{
              label: string; placeholder: string;
              list: string[]; setList: (v: string[]) => void;
              draft: string;  setDraft: (v: string) => void;
            }>
          ).map(({ label, placeholder, list, setList, draft, setDraft }) => (
            <div key={label}>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-[var(--muted-foreground)]">{label}</label>
                {list.length >= 30 && (
                  <span className="text-[10px] text-white/30">30/30</span>
                )}
              </div>
              {/* Chips */}
              {list.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {list.map((tag, i) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs bg-violet-500/15 border border-violet-500/25 text-violet-300"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(list, setList, i)}
                        className="text-violet-400/60 hover:text-violet-300 transition-colors ml-0.5"
                        aria-label={`Remove ${tag}`}
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              {/* Input row */}
              {list.length < 30 && (
                <div className="flex gap-2">
                  <input
                    className="settings-input flex-1"
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    placeholder={placeholder}
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag(list, setList, draft, setDraft);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => addTag(list, setList, draft, setDraft)}
                    className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-violet-400 hover:text-violet-300 border border-violet-500/20 hover:border-violet-500/40 rounded-[3px] transition-colors bg-violet-950/20 hover:bg-violet-950/30 whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              )}
            </div>
          ))}
        </section>

        {/* ── Public Profile ───────────────────────────────────────── */}
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
                className="settings-input"
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
              <input className="settings-input" value={form.headline} onChange={set("headline")} placeholder="Student founder · Tokyo" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1.5 block">School</label>
              <input className="settings-input" value={form.school} onChange={set("school")} placeholder="e.g. Keio Senior High School" />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1.5 block">Location</label>
              <input className="settings-input" value={form.location} onChange={set("location")} placeholder="e.g. Tokyo, Japan" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1.5 block">Bio</label>
            <textarea
              className="settings-input min-h-[88px] resize-y"
              value={form.bio}
              onChange={set("bio")}
              placeholder="Tell your story…"
            />
          </div>
        </section>

        {/* ── Social Links ─────────────────────────────────────────── */}
        <section className="card p-6 space-y-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-emerald-600/10 border border-emerald-600/20 flex items-center justify-center">
              <Globe className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-semibold">Social Links</h2>
              <p className="text-xs text-[var(--muted-foreground)]">Shown on your public portfolio and to connected users</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1.5 flex items-center gap-1.5 block">
                <XIcon className="w-3.5 h-3.5 text-sky-400" /> Twitter / X handle
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm select-none">@</span>
                <input className="settings-input pl-7" value={form.twitterHandle} onChange={set("twitterHandle")} placeholder="yourhandle" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1.5 flex items-center gap-1.5 block">
                <InstagramIcon className="w-3.5 h-3.5 text-pink-400" /> Instagram handle
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm select-none">@</span>
                <input className="settings-input pl-7" value={form.instagramHandle} onChange={set("instagramHandle")} placeholder="yourhandle" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1.5 flex items-center gap-1.5 block">
                <LinkedInIcon className="w-3.5 h-3.5 text-blue-400" /> LinkedIn URL
              </label>
              <input className="settings-input" value={form.linkedinUrl} onChange={set("linkedinUrl")} placeholder="https://linkedin.com/in/yourname" />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1.5 flex items-center gap-1.5 block">
                <Globe className="w-3.5 h-3.5 text-emerald-400" /> Website
              </label>
              <input className="settings-input" value={form.websiteUrl} onChange={set("websiteUrl")} placeholder="https://yoursite.com" />
            </div>
          </div>
        </section>

        {/* ── Save ─────────────────────────────────────────────────── */}
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
