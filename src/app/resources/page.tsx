"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import {
  Search, Download, ExternalLink, Loader2, BookOpen, Plus, X
} from "lucide-react";

const CATEGORIES = ["legal", "marketing", "fundraising", "operations", "pitch", "other"];
const TYPES = ["template", "guide", "video", "tool", "checklist"];

const TYPE_COLORS: Record<string, string> = {
  template: "bg-indigo-950/60 text-indigo-300",
  guide: "bg-blue-950/60 text-blue-300",
  video: "bg-red-950/60 text-red-300",
  tool: "bg-emerald-950/60 text-emerald-300",
  checklist: "bg-amber-950/60 text-amber-300",
};

const CATEGORY_COLORS: Record<string, string> = {
  legal: "bg-violet-950/60 text-violet-300",
  marketing: "bg-pink-950/60 text-pink-300",
  fundraising: "bg-orange-950/60 text-orange-300",
  operations: "bg-teal-950/60 text-teal-300",
  pitch: "bg-sky-950/60 text-sky-300",
  other: "bg-zinc-800 text-zinc-300",
};

interface ProjectResource {
  id: string;
  title: string;
  description?: string;
  category: string;
  type: string;
  fileUrl?: string;
  externalUrl?: string;
  tags: string[];
  downloadCount: number;
}

export default function ResourcesPage() {
  const { status } = useSession();
  const router = useRouter();
  const [resources, setResources] = useState<ProjectResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterType, setFilterType] = useState("");
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [submitForm, setSubmitForm] = useState({ title: "", description: "", category: "legal", type: "guide", externalUrl: "" });
  const [submitting, setSubmitting] = useState(false);

  const fetchResources = useCallback(async () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (filterCategory) params.set("category", filterCategory);
    if (filterType) params.set("type", filterType);
    const res = await fetch(`/api/project-resources?${params}`);
    if (res.ok) setResources(await res.json());
    setLoading(false);
  }, [search, filterCategory, filterType]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin?callbackUrl=/resources");
    if (status === "authenticated") fetchResources();
  }, [status, router, fetchResources]);

  useEffect(() => {
    if (status === "authenticated") {
      const t = setTimeout(fetchResources, 300);
      return () => clearTimeout(t);
    }
  }, [search, filterCategory, filterType, status, fetchResources]);

  const handleDownload = async (resource: ProjectResource) => {
    await fetch(`/api/project-resources/${resource.id}/download`, { method: "PATCH" });
    const url = resource.externalUrl ?? resource.fileUrl;
    if (url) window.open(url, "_blank");
    setResources(prev => prev.map(r => r.id === resource.id ? { ...r, downloadCount: r.downloadCount + 1 } : r));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const res = await fetch("/api/project-resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...submitForm, tags: [] }),
    });
    if (res.ok) {
      await fetchResources();
      setShowSubmitForm(false);
      setSubmitForm({ title: "", description: "", category: "legal", type: "guide", externalUrl: "" });
    }
    setSubmitting(false);
  };

  if (status === "loading") return <div className="min-h-screen"><Navbar /><div className="flex items-center justify-center mt-32"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div></div>;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Resource Library</h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">Templates, guides, and tools to help you build and grow</p>
          </div>
          <Button size="sm" variant="secondary" onClick={() => setShowSubmitForm(true)}>
            <Plus className="w-4 h-4" /> Submit Resource
          </Button>
        </div>

        <div className="flex gap-6">
          {/* Filters */}
          <aside className="w-52 flex-shrink-0 space-y-5">
            <div>
              <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Category</p>
              <div className="space-y-1">
                <button onClick={() => setFilterCategory("")} className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${!filterCategory ? "bg-indigo-600/10 text-indigo-400" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-raised)]"}`}>All Categories</button>
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setFilterCategory(c === filterCategory ? "" : c)} className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors capitalize ${filterCategory === c ? "bg-indigo-600/10 text-indigo-400" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-raised)]"}`}>{c}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Type</p>
              <div className="space-y-1">
                <button onClick={() => setFilterType("")} className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${!filterType ? "bg-indigo-600/10 text-indigo-400" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-raised)]"}`}>All Types</button>
                {TYPES.map(t => (
                  <button key={t} onClick={() => setFilterType(t === filterType ? "" : t)} className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors capitalize ${filterType === t ? "bg-indigo-600/10 text-indigo-400" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-raised)]"}`}>{t}</button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1 min-w-0">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
              <input className="input pl-9" placeholder="Search resources..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
            ) : resources.length === 0 ? (
              <div className="card text-center py-12">
                <BookOpen className="w-10 h-10 text-[var(--muted-foreground)] mx-auto mb-3" />
                <p className="text-[var(--muted-foreground)]">No resources found.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {resources.map(resource => (
                  <div key={resource.id} className="card hover:border-indigo-500/30 transition-all flex flex-col">
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${CATEGORY_COLORS[resource.category] ?? "bg-zinc-800 text-zinc-300"}`}>{resource.category}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${TYPE_COLORS[resource.type] ?? "bg-zinc-800 text-zinc-300"}`}>{resource.type}</span>
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{resource.title}</h3>
                    {resource.description && (
                      <p className="text-xs text-[var(--muted-foreground)] line-clamp-3 flex-1 mb-3">{resource.description}</p>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-[var(--border)]">
                      <span className="text-xs text-[var(--muted-foreground)] flex items-center gap-1">
                        <Download className="w-3 h-3" /> {resource.downloadCount}
                      </span>
                      <button
                        onClick={() => handleDownload(resource)}
                        disabled={!resource.fileUrl && !resource.externalUrl}
                        className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {resource.externalUrl ? <ExternalLink className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                        {resource.externalUrl ? "Open" : "Download"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submit Modal */}
      {showSubmitForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSubmitForm(false)} />
          <div className="relative bg-[var(--surface-raised)] rounded-xl border border-[var(--border)] w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">Submit a Resource</h2>
              <button onClick={() => setShowSubmitForm(false)}><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <input className="input" placeholder="Title *" value={submitForm.title} onChange={e => setSubmitForm(f => ({ ...f, title: e.target.value }))} />
              <textarea className="input min-h-[80px]" placeholder="Description" value={submitForm.description} onChange={e => setSubmitForm(f => ({ ...f, description: e.target.value }))} />
              <div className="grid grid-cols-2 gap-3">
                <select className="input" value={submitForm.category} onChange={e => setSubmitForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c} value={c} style={{ background: "var(--surface-raised)" }}>{c}</option>)}
                </select>
                <select className="input" value={submitForm.type} onChange={e => setSubmitForm(f => ({ ...f, type: e.target.value }))}>
                  {TYPES.map(t => <option key={t} value={t} style={{ background: "var(--surface-raised)" }}>{t}</option>)}
                </select>
              </div>
              <input className="input" placeholder="URL (link to resource)" value={submitForm.externalUrl} onChange={e => setSubmitForm(f => ({ ...f, externalUrl: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-[var(--border)]">
              <Button variant="secondary" onClick={() => setShowSubmitForm(false)}>Cancel</Button>
              <Button onClick={handleSubmit} loading={submitting} disabled={!submitForm.title}>Submit</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
