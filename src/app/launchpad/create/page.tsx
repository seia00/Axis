"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";

const STAGES = ["idea", "building", "launched", "scaling"];
const CATEGORIES = ["technology", "social impact", "education", "health", "environment", "arts", "business", "other"];

interface RoleForm {
  title: string;
  description: string;
  skills: string;
  commitment: string;
}

export default function CreateProjectPage() {
  const { status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    tagline: "",
    description: "",
    stage: "idea",
    category: "technology",
    tags: "",
    websiteUrl: "",
  });
  const [roles, setRoles] = useState<RoleForm[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (status === "unauthenticated") {
    router.push("/auth/signin?callbackUrl=/launchpad/create");
    return null;
  }

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.description.trim()) e.description = "Description is required";
    if (!form.category) e.category = "Category is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        tags: form.tags.split(",").map(t => t.trim()).filter(Boolean),
        roles: roles.map(r => ({
          ...r,
          skills: r.skills.split(",").map(s => s.trim()).filter(Boolean),
        })),
      }),
    });
    if (res.ok) {
      const project = await res.json();
      router.push(`/launchpad/${project.id}`);
    }
    setSaving(false);
  };

  const addRole = () => setRoles(prev => [...prev, { title: "", description: "", skills: "", commitment: "" }]);
  const removeRole = (i: number) => setRoles(prev => prev.filter((_, idx) => idx !== i));
  const updateRole = (i: number, field: keyof RoleForm, value: string) => {
    setRoles(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/launchpad" className="inline-flex items-center gap-1.5 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Launch Pad
        </Link>

        <h1 className="text-2xl font-bold tracking-tight mb-6">Create a Project</h1>

        <div className="space-y-5">
          <div className="card space-y-4">
            <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Project Details</h2>
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1.5">Title *</label>
              <input className="input" placeholder="Project name" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1.5">Tagline</label>
              <input className="input" placeholder="One-line description" value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1.5">Description *</label>
              <textarea className="input min-h-[100px] resize-y" placeholder="What are you building? What problem does it solve?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1.5">Stage</label>
                <select className="input" value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))}>
                  {STAGES.map(s => <option key={s} value={s} style={{ background: "var(--surface-raised)" }} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1.5">Category *</label>
                <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c} value={c} style={{ background: "var(--surface-raised)" }} className="capitalize">{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1.5">Tags (comma-separated)</label>
              <input className="input" placeholder="e.g. AI, education, Japan" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1.5">Website URL</label>
              <input className="input" type="url" placeholder="https://..." value={form.websiteUrl} onChange={e => setForm(f => ({ ...f, websiteUrl: e.target.value }))} />
            </div>
          </div>

          {/* Roles */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">Open Roles</h2>
              <Button variant="secondary" size="sm" onClick={addRole}>
                <Plus className="w-4 h-4" /> Add Role
              </Button>
            </div>
            {roles.length === 0 ? (
              <p className="text-sm text-[var(--muted-foreground)] text-center py-4">Add roles to attract collaborators</p>
            ) : (
              <div className="space-y-4">
                {roles.map((role, i) => (
                  <div key={i} className="rounded-lg border border-[var(--border)] p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-[var(--muted-foreground)]">Role {i + 1}</p>
                      <button onClick={() => removeRole(i)} className="p-1 rounded hover:bg-red-950/30 text-[var(--muted-foreground)] hover:text-red-400 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input className="input" placeholder="Role title (e.g. Frontend Developer)" value={role.title} onChange={e => updateRole(i, "title", e.target.value)} />
                    <input className="input" placeholder="Description" value={role.description} onChange={e => updateRole(i, "description", e.target.value)} />
                    <input className="input" placeholder="Skills needed (comma-separated)" value={role.skills} onChange={e => updateRole(i, "skills", e.target.value)} />
                    <input className="input" placeholder="Time commitment (e.g. 5 hrs/week)" value={role.commitment} onChange={e => updateRole(i, "commitment", e.target.value)} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Link href="/launchpad"><Button variant="secondary">Cancel</Button></Link>
            <Button onClick={handleSubmit} loading={saving}>Launch Project</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
