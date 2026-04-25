"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Users, Globe, CheckCircle, X, Loader2, TrendingUp } from "lucide-react";

const STAGE_COLORS: Record<string, string> = {
  idea: "bg-amber-950/60 text-amber-300 border border-amber-800/40",
  building: "bg-blue-950/60 text-blue-300 border border-blue-800/40",
  launched: "bg-emerald-950/60 text-emerald-300 border border-emerald-800/40",
  scaling: "bg-violet-950/60 text-violet-300 border border-violet-800/40",
};

interface Role {
  id: string;
  title: string;
  description?: string;
  skills: string[];
  commitment?: string;
  isFilled: boolean;
}

interface Member {
  id: string;
  userId: string;
  role: string;
  user: { id: string; name?: string; image?: string };
}

interface Project {
  id: string;
  title: string;
  tagline?: string;
  description: string;
  stage: string;
  category: string;
  tags: string[];
  websiteUrl?: string;
  creatorId: string;
  ventureStage?: string;
  roles: Role[];
  members: Member[];
  creator: { id: string; name?: string; image?: string; email?: string };
}

export default function ProjectDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [applyingRole, setApplyingRole] = useState<Role | null>(null);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [applied, setApplied] = useState(false);
  const [showVentureModal, setShowVentureModal] = useState(false);
  const [ventureForm, setVentureForm] = useState({ description: "", teamOverview: "", traction: "", helpNeeded: "" });
  const [ventureSubmitting, setVentureSubmitting] = useState(false);
  const [ventureApplied, setVentureApplied] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin?callbackUrl=/launchpad/" + id);
    if (status === "authenticated") {
      fetch(`/api/projects/${id}`).then(r => r.json()).then(data => {
        setProject(data);
        setLoading(false);
        if (data?.description) {
          setVentureForm(f => ({ ...f, description: data.description }));
        }
      });
    }
  }, [status, id, router]);

  const handleVentureApply = async () => {
    if (!project) return;
    setVentureSubmitting(true);
    const res = await fetch("/api/ventures/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId: project.id, ...ventureForm }),
    });
    if (res.ok) {
      setVentureApplied(true);
      setShowVentureModal(false);
      setProject(prev => prev ? { ...prev, ventureStage: "applied" } : prev);
    } else {
      const err = await res.json();
      alert(err.error ?? "Failed to submit");
    }
    setVentureSubmitting(false);
  };

  const handleApply = async () => {
    if (!applyingRole) return;
    setSubmitting(true);
    const res = await fetch(`/api/projects/${id}/apply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roleId: applyingRole.id, message }),
    });
    if (res.ok) {
      setApplied(true);
      setApplyingRole(null);
      setMessage("");
    } else {
      const err = await res.json();
      alert(err.error ?? "Failed to apply");
    }
    setSubmitting(false);
  };

  const isCreator = session?.user?.id === project?.creatorId;

  if (loading || status === "loading") return <div className="min-h-screen"><Navbar /><div className="flex items-center justify-center mt-32"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div></div>;
  if (!project) return <div className="min-h-screen"><Navbar /><p className="text-center mt-20 text-[var(--muted-foreground)]">Project not found</p></div>;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/launchpad" className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Launch Pad
        </Link>

        {applied && (
          <div className="mb-4 p-3 rounded-lg border border-emerald-800/40 bg-emerald-950/20 text-emerald-300 text-sm flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> Application submitted! The team will review it shortly.
          </div>
        )}

        {ventureApplied && (
          <div className="mb-4 p-3 rounded-lg border border-violet-800/40 bg-violet-950/20 text-violet-300 text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> AXIS Ventures application submitted! We'll review it soon.
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STAGE_COLORS[project.stage] ?? "bg-zinc-800 text-zinc-300"}`}>{project.stage}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--surface-raised)] text-[var(--muted-foreground)] capitalize">{project.category}</span>
              </div>
              <h1 className="text-2xl font-bold mb-1">{project.title}</h1>
              {project.tagline && <p className="text-indigo-300 mb-2">{project.tagline}</p>}
              {project.websiteUrl && (
                <a href={project.websiteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-indigo-300 transition-colors mb-3">
                  <Globe className="w-3.5 h-3.5" /> {project.websiteUrl}
                </a>
              )}
              <p className="text-sm text-[var(--muted-foreground)] leading-relaxed whitespace-pre-wrap">{project.description}</p>
              {project.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {project.tags.map(t => <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-indigo-950/60 text-indigo-300">{t}</span>)}
                </div>
              )}
            </div>

            {/* Open Roles */}
            <div className="card">
              <h2 className="text-sm font-semibold mb-4">Open Roles</h2>
              {project.roles.filter(r => !r.isFilled).length === 0 ? (
                <p className="text-sm text-[var(--muted-foreground)]">No open roles at the moment.</p>
              ) : (
                <div className="space-y-3">
                  {project.roles.filter(r => !r.isFilled).map(role => (
                    <div key={role.id} className="rounded-lg border border-[var(--border)] p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm">{role.title}</h3>
                          {role.description && <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{role.description}</p>}
                          {role.commitment && <p className="text-xs text-[var(--muted-foreground)] mt-1">Commitment: {role.commitment}</p>}
                          {role.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {role.skills.map(s => <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-[var(--surface-raised)] text-[var(--muted-foreground)]">{s}</span>)}
                            </div>
                          )}
                        </div>
                        {!isCreator && (
                          <Button size="sm" onClick={() => setApplyingRole(role)}>Apply</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {isCreator && !project.ventureStage && (
              <div className="card border-violet-800/30 bg-violet-950/10">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-violet-400" />
                  <h3 className="text-sm font-semibold text-violet-300">AXIS Ventures</h3>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mb-3">
                  Apply to AXIS Ventures to get mentorship, resources, and support to launch your project.
                </p>
                <Button size="sm" onClick={() => setShowVentureModal(true)} className="w-full">
                  <TrendingUp className="w-4 h-4" /> Apply to AXIS Ventures
                </Button>
              </div>
            )}
            {isCreator && project.ventureStage && (
              <div className="card border-violet-800/30 bg-violet-950/10">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-violet-400" />
                  <div>
                    <p className="text-sm font-semibold text-violet-300">AXIS Ventures</p>
                    <p className="text-xs text-[var(--muted-foreground)] capitalize">Status: {project.ventureStage}</p>
                  </div>
                </div>
              </div>
            )}
            <div className="card">
              <h3 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">Team</h3>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  {project.creator?.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={project.creator.image} alt="" className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center"><Users className="w-4 h-4 text-indigo-400" /></div>
                  )}
                  <div>
                    <p className="text-sm font-medium">{project.creator?.name ?? "Creator"}</p>
                    <p className="text-xs text-indigo-300">Creator</p>
                  </div>
                </div>
                {project.members.filter(m => m.userId !== project.creatorId).map(member => (
                  <div key={member.id} className="flex items-center gap-2.5">
                    {member.user?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={member.user.image} alt="" className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center"><Users className="w-4 h-4 text-indigo-400" /></div>
                    )}
                    <div>
                      <p className="text-sm font-medium">{member.user?.name ?? "Member"}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AXIS Ventures Apply Modal */}
      {showVentureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowVentureModal(false)} />
          <div className="relative bg-[var(--surface-raised)] rounded-xl border border-[var(--border)] w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-violet-400" />
                <h2 className="text-lg font-semibold">Apply to AXIS Ventures</h2>
              </div>
              <button onClick={() => setShowVentureModal(false)}><X className="w-4 h-4" /></button>
            </div>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              Tell us more about your project and what you need to take it to the next level.
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-[var(--muted-foreground)] block mb-1">Project description for AXIS Ventures *</label>
                <textarea
                  className="input min-h-[80px]"
                  placeholder="Describe your project and its goals..."
                  value={ventureForm.description}
                  onChange={e => setVentureForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-[var(--muted-foreground)] block mb-1">Team overview *</label>
                <textarea
                  className="input min-h-[60px]"
                  placeholder="Who are the team members and what are their roles?"
                  value={ventureForm.teamOverview}
                  onChange={e => setVentureForm(f => ({ ...f, teamOverview: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-[var(--muted-foreground)] block mb-1">Traction so far</label>
                <textarea
                  className="input min-h-[60px]"
                  placeholder="What have you built? Who have you reached? Any early results?"
                  value={ventureForm.traction}
                  onChange={e => setVentureForm(f => ({ ...f, traction: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-[var(--muted-foreground)] block mb-1">What help do you need? *</label>
                <textarea
                  className="input min-h-[60px]"
                  placeholder="Mentorship, funding, resources, network...?"
                  value={ventureForm.helpNeeded}
                  onChange={e => setVentureForm(f => ({ ...f, helpNeeded: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[var(--border)]">
              <Button variant="secondary" onClick={() => setShowVentureModal(false)}>Cancel</Button>
              <Button
                onClick={handleVentureApply}
                loading={ventureSubmitting}
                disabled={!ventureForm.description || !ventureForm.teamOverview || !ventureForm.helpNeeded}
              >
                Submit Application
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {applyingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setApplyingRole(null)} />
          <div className="relative bg-[var(--surface-raised)] rounded-xl border border-[var(--border)] w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Apply for {applyingRole.title}</h2>
              <button onClick={() => setApplyingRole(null)}><X className="w-4 h-4" /></button>
            </div>
            <p className="text-sm text-[var(--muted-foreground)] mb-3">Tell the team why you're a great fit for this role.</p>
            <textarea
              className="input min-h-[120px] resize-y"
              placeholder="Introduce yourself and explain why you want to join..."
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="secondary" onClick={() => setApplyingRole(null)}>Cancel</Button>
              <Button onClick={handleApply} loading={submitting} disabled={!message.trim()}>Submit Application</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
