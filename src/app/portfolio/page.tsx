"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import {
  Plus, User, Clock, Users, Download, Share2, Pencil, Trash2,
  Trophy, Briefcase, Code2, Heart, BookOpen, Star, X, Loader2, CheckCircle
} from "lucide-react";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip, Legend
} from "recharts";
import { format } from "date-fns";

const ACTIVITY_TYPES = [
  "competition", "volunteer", "program", "club", "internship", "project", "award"
] as const;

const TYPE_COLORS: Record<string, string> = {
  competition: "#6366f1",
  volunteer: "#10b981",
  program: "#8b5cf6",
  club: "#f59e0b",
  internship: "#3b82f6",
  project: "#ec4899",
  award: "#f97316",
};

const TYPE_ICONS: Record<string, React.ElementType> = {
  competition: Trophy,
  volunteer: Heart,
  program: BookOpen,
  club: Users,
  internship: Briefcase,
  project: Code2,
  award: Star,
};

interface Activity {
  id: string;
  title: string;
  type: string;
  organization?: string;
  role?: string;
  description?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  hoursPerWeek?: number;
  peopleReached?: number;
  awards: string[];
  tags: string[];
  proofUrl?: string;
  isVerified: boolean;
}

const emptyForm = {
  title: "",
  type: "competition",
  organization: "",
  role: "",
  description: "",
  startDate: "",
  endDate: "",
  isCurrent: false,
  hoursPerWeek: "",
  peopleReached: "",
  awards: [] as string[],
  tags: [] as string[],
  proofUrl: "",
};

export default function PortfolioPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [awardInput, setAwardInput] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState("");

  const fetchActivities = useCallback(async () => {
    const res = await fetch("/api/activities");
    if (res.ok) {
      const data = await res.json();
      setActivities(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin?callbackUrl=/portfolio");
    if (status === "authenticated") {
      fetchActivities();
      // Fetch user verification status
      fetch("/api/activities").then(r => r.ok ? r.json() : []).catch(() => []);
    }
  }, [status, router, fetchActivities]);

  const handleClaimVerified = async () => {
    setVerifyLoading(true);
    setVerifyError("");
    const res = await fetch("/api/user/verify-claim", { method: "POST" });
    if (res.ok) {
      setIsVerified(true);
    } else {
      const data = await res.json();
      setVerifyError(data.error ?? "Unable to verify at this time.");
    }
    setVerifyLoading(false);
  };

  const openAddModal = () => {
    setEditingActivity(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (activity: Activity) => {
    setEditingActivity(activity);
    setForm({
      title: activity.title,
      type: activity.type,
      organization: activity.organization ?? "",
      role: activity.role ?? "",
      description: activity.description ?? "",
      startDate: activity.startDate.slice(0, 10),
      endDate: activity.endDate ? activity.endDate.slice(0, 10) : "",
      isCurrent: activity.isCurrent,
      hoursPerWeek: activity.hoursPerWeek?.toString() ?? "",
      peopleReached: activity.peopleReached?.toString() ?? "",
      awards: activity.awards,
      tags: activity.tags,
      proofUrl: activity.proofUrl ?? "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const method = editingActivity ? "PATCH" : "POST";
    const url = editingActivity ? `/api/activities/${editingActivity.id}` : "/api/activities";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      await fetchActivities();
      setShowModal(false);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this activity?")) return;
    await fetch(`/api/activities/${id}`, { method: "DELETE" });
    setActivities(prev => prev.filter(a => a.id !== id));
  };

  const totalHours = activities.reduce((sum, a) => sum + (a.hoursPerWeek ?? 0), 0);
  const totalPeople = activities.reduce((sum, a) => sum + (a.peopleReached ?? 0), 0);

  // Build radar chart data from tags
  const tagCounts: Record<string, number> = {};
  activities.forEach(a => a.tags.forEach(t => { tagCounts[t] = (tagCounts[t] ?? 0) + 1; }));
  const radarData = Object.entries(tagCounts).slice(0, 8).map(([tag, count]) => ({ subject: tag, value: count }));

  // Build pie chart data from types
  const typeCounts: Record<string, number> = {};
  activities.forEach(a => { typeCounts[a.type] = (typeCounts[a.type] ?? 0) + 1; });
  const pieData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }));

  const handleShare = () => {
    const url = `${window.location.origin}/portfolio/${session?.user?.email?.split("@")[0]}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCommonApp = () => {
    const top10 = activities.slice(0, 10);
    const text = top10.map((a, i) => {
      const desc = (a.description ?? "").substring(0, 150);
      return `${i + 1}. ${a.title} – ${a.organization ?? ""}. ${desc}`;
    }).join("\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "common-app-activities.txt";
    a.click();
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center mt-32">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="card mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-indigo-600/20 border border-indigo-600/30 flex items-center justify-center flex-shrink-0">
                {session?.user?.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={session.user.image} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-7 h-7 text-indigo-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl font-bold">{session?.user?.name ?? "Your Portfolio"}</h1>
                  {isVerified && (
                    <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800/40">
                      <Star className="w-3 h-3" /> Verified
                    </span>
                  )}
                </div>
                <p className="text-sm text-[var(--muted-foreground)]">{session?.user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {!isVerified && (
                <Button variant="secondary" size="sm" onClick={handleClaimVerified} loading={verifyLoading}>
                  <Star className="w-4 h-4 text-amber-400" />
                  Claim Verified Status
                </Button>
              )}
              <Button variant="secondary" size="sm" onClick={handleCommonApp}>
                <Download className="w-4 h-4" />
                Common App Export
              </Button>
              <Button variant="secondary" size="sm" onClick={handleShare}>
                {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
                {copied ? "Copied!" : "Share Link"}
              </Button>
              <Button size="sm" onClick={openAddModal}>
                <Plus className="w-4 h-4" />
                Add Activity
              </Button>
            </div>
          </div>

          {verifyError && (
            <div className="mt-3 p-3 rounded-lg border border-amber-800/40 bg-amber-950/20 text-amber-300 text-sm">
              {verifyError}
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-[var(--border)]">
            {[
              { label: "Activities", value: activities.length },
              { label: "Hours/Week", value: totalHours },
              { label: "People Reached", value: totalPeople.toLocaleString() },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-bold gradient-text">{value}</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Activity Timeline */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Activity Timeline</h2>
              <span className="text-xs text-[var(--muted-foreground)]">{activities.length} activities</span>
            </div>

            {activities.length === 0 ? (
              <div className="card text-center py-12">
                <User className="w-10 h-10 text-[var(--muted-foreground)] mx-auto mb-3" />
                <p className="text-[var(--muted-foreground)] mb-4">No activities yet. Add your first one!</p>
                <Button onClick={openAddModal} size="sm">
                  <Plus className="w-4 h-4" /> Add Activity
                </Button>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-5 top-0 bottom-0 w-px bg-[var(--border)]" />
                <div className="space-y-4">
                  {activities.map(activity => {
                    const Icon = TYPE_ICONS[activity.type] ?? Star;
                    const color = TYPE_COLORS[activity.type] ?? "#6366f1";
                    return (
                      <div key={activity.id} className="relative pl-14">
                        <div
                          className="absolute left-2 top-4 w-6 h-6 rounded-full border-2 flex items-center justify-center"
                          style={{ borderColor: color, backgroundColor: `${color}20` }}
                        >
                          <Icon className="w-3 h-3" style={{ color }} />
                        </div>
                        <div className="card hover:border-indigo-500/30 transition-all">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-medium text-sm">{activity.title}</h3>
                                {activity.isVerified && (
                                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-950/60 text-blue-300 border border-blue-800/40">
                                    ✓ Verified
                                  </span>
                                )}
                              </div>
                              {activity.organization && (
                                <p className="text-xs text-indigo-300 mt-0.5">{activity.organization}{activity.role && ` · ${activity.role}`}</p>
                              )}
                              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                                {format(new Date(activity.startDate), "MMM yyyy")}
                                {" – "}
                                {activity.isCurrent ? "Present" : activity.endDate ? format(new Date(activity.endDate), "MMM yyyy") : ""}
                              </p>
                              {activity.description && (
                                <p className="text-xs text-[var(--muted-foreground)] mt-1.5 line-clamp-2">{activity.description}</p>
                              )}
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                <span
                                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                                  style={{ backgroundColor: `${color}20`, color }}
                                >
                                  {activity.type}
                                </span>
                                {activity.hoursPerWeek && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--surface-raised)] text-[var(--muted-foreground)]">
                                    <Clock className="w-3 h-3 inline mr-1" />{activity.hoursPerWeek}h/wk
                                  </span>
                                )}
                                {activity.peopleReached && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--surface-raised)] text-[var(--muted-foreground)]">
                                    <Users className="w-3 h-3 inline mr-1" />{activity.peopleReached.toLocaleString()} reached
                                  </span>
                                )}
                                {activity.tags.map(t => (
                                  <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-indigo-950/60 text-indigo-300">
                                    {t}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                onClick={() => openEditModal(activity)}
                                className="p-1.5 rounded-lg hover:bg-[var(--surface-raised)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(activity.id)}
                                className="p-1.5 rounded-lg hover:bg-red-950/30 text-[var(--muted-foreground)] hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Impact Dashboard */}
          <div className="space-y-4">
            <div className="card">
              <h3 className="text-sm font-semibold mb-4">Skill Radar</h3>
              {radarData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: "#6b7280" }} />
                    <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-[var(--muted-foreground)] text-center py-8">Add activities with tags to see your skill radar</p>
              )}
            </div>

            <div className="card">
              <h3 className="text-sm font-semibold mb-4">Activity Mix</h3>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}>
                      {pieData.map((entry) => (
                        <Cell key={entry.name} fill={TYPE_COLORS[entry.name] ?? "#6366f1"} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "var(--surface-raised)", border: "1px solid var(--border)", borderRadius: "8px", fontSize: 12 }} />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-[var(--muted-foreground)] text-center py-8">Add activities to see your mix</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-[var(--surface-raised)] rounded-xl border border-[var(--border)] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">{editingActivity ? "Edit Activity" : "Add Activity"}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-[var(--surface-overlay)] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1.5">Title *</label>
                  <input
                    className="input"
                    placeholder="e.g. Regional Science Olympiad"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1.5">Type *</label>
                  <select
                    className="input"
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  >
                    {ACTIVITY_TYPES.map(t => (
                      <option key={t} value={t} style={{ background: "var(--surface-raised)" }}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1.5">Organization</label>
                  <input
                    className="input"
                    placeholder="Organization name"
                    value={form.organization}
                    onChange={e => setForm(f => ({ ...f, organization: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1.5">Your Role</label>
                  <input
                    className="input"
                    placeholder="e.g. Team Leader"
                    value={form.role}
                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1.5">Hours / Week</label>
                  <input
                    className="input"
                    type="number"
                    placeholder="0"
                    value={form.hoursPerWeek}
                    onChange={e => setForm(f => ({ ...f, hoursPerWeek: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1.5">Start Date *</label>
                  <input
                    className="input"
                    type="date"
                    value={form.startDate}
                    onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1.5">End Date</label>
                  <input
                    className="input"
                    type="date"
                    value={form.endDate}
                    disabled={form.isCurrent}
                    onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                  />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="isCurrent"
                    checked={form.isCurrent}
                    onChange={e => setForm(f => ({ ...f, isCurrent: e.target.checked, endDate: e.target.checked ? "" : f.endDate }))}
                    className="w-4 h-4 accent-indigo-500"
                  />
                  <label htmlFor="isCurrent" className="text-sm text-[var(--foreground)]">Currently Active</label>
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1.5">People Reached</label>
                  <input
                    className="input"
                    type="number"
                    placeholder="0"
                    value={form.peopleReached}
                    onChange={e => setForm(f => ({ ...f, peopleReached: e.target.value }))}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1.5">Description</label>
                  <textarea
                    className="input min-h-[80px] resize-y"
                    placeholder="Describe your role and impact..."
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1.5">Awards (press Enter to add)</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {form.awards.map(a => (
                      <span key={a} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800/40">
                        {a}
                        <button onClick={() => setForm(f => ({ ...f, awards: f.awards.filter(x => x !== a) }))}><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                  <input
                    className="input"
                    placeholder="Add award and press Enter"
                    value={awardInput}
                    onChange={e => setAwardInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter" && awardInput.trim()) {
                        e.preventDefault();
                        setForm(f => ({ ...f, awards: [...f.awards, awardInput.trim()] }));
                        setAwardInput("");
                      }
                    }}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1.5">Tags (press Enter to add)</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {form.tags.map(t => (
                      <span key={t} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-indigo-950/60 text-indigo-300">
                        {t}
                        <button onClick={() => setForm(f => ({ ...f, tags: f.tags.filter(x => x !== t) }))}><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                  <input
                    className="input"
                    placeholder="Add tag and press Enter"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter" && tagInput.trim()) {
                        e.preventDefault();
                        setForm(f => ({ ...f, tags: [...f.tags, tagInput.trim()] }));
                        setTagInput("");
                      }
                    }}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1.5">Proof URL</label>
                  <input
                    className="input"
                    type="url"
                    placeholder="https://..."
                    value={form.proofUrl}
                    onChange={e => setForm(f => ({ ...f, proofUrl: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-[var(--border)]">
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleSave} loading={saving} disabled={!form.title || !form.startDate}>
                {editingActivity ? "Save Changes" : "Add Activity"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
