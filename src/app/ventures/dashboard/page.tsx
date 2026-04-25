"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, Circle, Plus, User, TrendingUp, X } from "lucide-react";

interface Milestone {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  dueDate?: string;
  completedAt?: string;
}

interface Project {
  id: string;
  title: string;
  ventureStage?: string;
  mentorAssigned?: string;
  stage: string;
}

export default function VenturesDashboardPage() {
  const { status } = useSession();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({ title: "", description: "", dueDate: "" });
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    // Get user's venture projects
    const res = await fetch("/api/projects");
    if (res.ok) {
      const projects: Project[] = await res.json();
      const ventureProject = projects.find(p => p.ventureStage === "accepted" || p.ventureStage === "mentoring" || p.ventureStage === "launched");
      if (ventureProject) {
        setProject(ventureProject);
        const msRes = await fetch(`/api/milestones?projectId=${ventureProject.id}`);
        if (msRes.ok) setMilestones(await msRes.json());
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin?callbackUrl=/ventures/dashboard");
    if (status === "authenticated") fetchData();
  }, [status, router, fetchData]);

  const toggleMilestone = async (id: string, current: boolean) => {
    const res = await fetch("/api/milestones", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isCompleted: !current }),
    });
    if (res.ok) {
      const updated = await res.json();
      setMilestones(prev => prev.map(m => m.id === id ? updated : m));
    }
  };

  const handleAddMilestone = async () => {
    if (!project) return;
    setSaving(true);
    const res = await fetch("/api/milestones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...milestoneForm, projectId: project.id }),
    });
    if (res.ok) {
      await fetchData();
      setShowAddMilestone(false);
      setMilestoneForm({ title: "", description: "", dueDate: "" });
    }
    setSaving(false);
  };

  const completedCount = milestones.filter(m => m.isCompleted).length;
  const progress = milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0;

  if (status === "loading" || loading) return <div className="min-h-screen"><Navbar /><div className="flex items-center justify-center mt-32"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div></div>;

  if (!project) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
          <TrendingUp className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-3">Ventures Dashboard</h1>
          <p className="text-[var(--muted-foreground)] mb-6">Your project has not been accepted to AXIS Ventures yet, or you haven't applied.</p>
          <a href="/ventures" className="btn-primary px-6 py-3">Learn about AXIS Ventures</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-6 h-6 text-violet-400" />
          <h1 className="text-2xl font-bold tracking-tight">Ventures Dashboard</h1>
          <span className="text-xs px-2 py-0.5 rounded-full bg-violet-950/60 text-violet-300 border border-violet-800/40 capitalize ml-2">{project.ventureStage}</span>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Project Info */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-1">{project.title}</h2>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 bg-[var(--surface-raised)] rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-violet-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-violet-300">{progress}%</span>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">{completedCount} of {milestones.length} milestones complete</p>
            </div>

            {/* Milestones */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold">Milestones</h2>
                <Button size="sm" variant="secondary" onClick={() => setShowAddMilestone(true)}>
                  <Plus className="w-4 h-4" /> Add Milestone
                </Button>
              </div>
              {milestones.length === 0 ? (
                <p className="text-sm text-[var(--muted-foreground)] text-center py-6">No milestones yet. Add your first one!</p>
              ) : (
                <div className="space-y-3">
                  {milestones.map(m => (
                    <div key={m.id} className="flex items-start gap-3">
                      <button
                        onClick={() => toggleMilestone(m.id, m.isCompleted)}
                        className="mt-0.5 flex-shrink-0 transition-colors"
                      >
                        {m.isCompleted
                          ? <CheckCircle className="w-5 h-5 text-emerald-400" />
                          : <Circle className="w-5 h-5 text-[var(--muted-foreground)] hover:text-indigo-400" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${m.isCompleted ? "line-through text-[var(--muted-foreground)]" : ""}`}>{m.title}</p>
                        {m.description && <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{m.description}</p>}
                        {m.dueDate && <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Due: {new Date(m.dueDate).toLocaleDateString()}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {project.mentorAssigned && (
              <div className="card">
                <h3 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">Your Mentor</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-violet-600/20 flex items-center justify-center">
                    <User className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{project.mentorAssigned}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">AXIS Mentor</p>
                  </div>
                </div>
              </div>
            )}
            <div className="card">
              <h3 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3">Resources</h3>
              <a href="/resources" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors block">View Resource Library →</a>
            </div>
          </div>
        </div>
      </div>

      {showAddMilestone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddMilestone(false)} />
          <div className="relative bg-[var(--surface-raised)] rounded-xl border border-[var(--border)] w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Add Milestone</h2>
              <button onClick={() => setShowAddMilestone(false)}><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <input className="input" placeholder="Milestone title *" value={milestoneForm.title} onChange={e => setMilestoneForm(f => ({ ...f, title: e.target.value }))} />
              <textarea className="input min-h-[60px]" placeholder="Description" value={milestoneForm.description} onChange={e => setMilestoneForm(f => ({ ...f, description: e.target.value }))} />
              <div>
                <label className="text-xs text-[var(--muted-foreground)] block mb-1">Due Date</label>
                <input className="input" type="date" value={milestoneForm.dueDate} onChange={e => setMilestoneForm(f => ({ ...f, dueDate: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="secondary" onClick={() => setShowAddMilestone(false)}>Cancel</Button>
              <Button onClick={handleAddMilestone} loading={saving} disabled={!milestoneForm.title}>Add Milestone</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
