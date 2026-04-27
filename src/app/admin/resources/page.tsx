"use client";

import { useState, useEffect, useCallback } from "react";
import { Package, Plus, Pencil, Trash2, Download, ExternalLink, Loader2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

interface Resource {
  id: string;
  title: string;
  description: string | null;
  category: string;
  type: string;
  fileUrl: string | null;
  externalUrl: string | null;
  tags: string[];
  region: string | null;
  downloadCount: number;
  createdAt: string;
}

const CATEGORIES = ["legal", "marketing", "fundraising", "operations", "pitch", "other"];
const TYPES = ["template", "guide", "video", "tool", "checklist"];

const TYPE_COLORS: Record<string, string> = {
  template: "bg-indigo-950/60 text-indigo-300",
  guide: "bg-blue-950/60 text-blue-300",
  video: "bg-red-950/60 text-red-300",
  tool: "bg-emerald-950/60 text-emerald-300",
  checklist: "bg-amber-950/60 text-amber-300",
};

const emptyForm = {
  title: "", description: "", category: "legal", type: "guide",
  fileUrl: "", externalUrl: "", tags: [] as string[], region: "",
};

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [tagInput, setTagInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const fetchResources = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/resources");
    if (res.ok) setResources(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchResources(); }, [fetchResources]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setTagInput("");
    setShowModal(true);
  };

  const openEdit = (r: Resource) => {
    setEditingId(r.id);
    setForm({
      title: r.title,
      description: r.description ?? "",
      category: r.category,
      type: r.type,
      fileUrl: r.fileUrl ?? "",
      externalUrl: r.externalUrl ?? "",
      tags: r.tags,
      region: r.region ?? "",
    });
    setTagInput("");
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      ...form,
      fileUrl: form.fileUrl || undefined,
      externalUrl: form.externalUrl || undefined,
      description: form.description || undefined,
      region: form.region || undefined,
      ...(editingId ? { id: editingId } : {}),
    };

    const res = await fetch("/api/admin/resources", {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      setShowModal(false);
      fetchResources();
    }
  };

  const handleDelete = async (id: string) => {
    setActionLoading(id);
    await fetch(`/api/admin/resources?id=${id}`, { method: "DELETE" });
    setActionLoading(null);
    setDeleteId(null);
    fetchResources();
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t)) {
      setForm(f => ({ ...f, tags: [...f.tags, t] }));
    }
    setTagInput("");
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Package className="w-5 h-5 text-indigo-400" />
          <h1 className="text-2xl font-bold tracking-tight">Resources</h1>
          <span className="text-sm text-[var(--muted-foreground)] ml-1">({resources.length})</span>
        </div>
        <Button size="sm" onClick={openAdd}>
          <Plus className="w-4 h-4" /> Add Resource
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
        </div>
      ) : resources.length === 0 ? (
        <div className="card text-center py-16">
          <Package className="w-10 h-10 text-[var(--muted-foreground)] mx-auto mb-3 opacity-30" />
          <p className="text-[var(--muted-foreground)] mb-4">No resources yet.</p>
          <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4" /> Add First Resource</Button>
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-raised)]">
                  {["Title", "Category", "Type", "Downloads", "Link", "Added", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {resources.map(r => (
                  <tr key={r.id} className="hover:bg-[var(--surface-raised)] transition-colors">
                    <td className="px-4 py-3 max-w-[200px]">
                      <p className="font-medium text-xs truncate">{r.title}</p>
                      {r.description && (
                        <p className="text-xs text-[var(--muted-foreground)] truncate mt-0.5">{r.description}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--surface-overlay)] text-[var(--muted-foreground)] capitalize">
                        {r.category}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${TYPE_COLORS[r.type] ?? "bg-zinc-800 text-zinc-300"}`}>
                        {r.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--muted-foreground)]">
                      <span className="flex items-center gap-1">
                        <Download className="w-3 h-3" /> {r.downloadCount}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {(r.fileUrl || r.externalUrl) ? (
                        <a
                          href={r.fileUrl ?? r.externalUrl ?? "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="text-white/20">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--muted-foreground)] whitespace-nowrap">
                      {formatDate(r.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(r)}
                          className="p-1.5 rounded hover:bg-[var(--surface-overlay)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(r.id)}
                          className="p-1.5 rounded hover:bg-red-950/30 text-[var(--muted-foreground)] hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-[var(--surface-raised)] rounded-xl border border-[var(--border)] w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">{editingId ? "Edit Resource" : "Add Resource"}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded hover:bg-[var(--surface-overlay)] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1.5">Title *</label>
                <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Startup Legal Checklist" />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1.5">Description</label>
                <textarea className="input min-h-[72px] resize-y" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description of this resource…" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1.5">Category *</label>
                  <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map(c => <option key={c} value={c} style={{ background: "var(--surface-raised)" }} className="capitalize">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1.5">Type *</label>
                  <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    {TYPES.map(t => <option key={t} value={t} style={{ background: "var(--surface-raised)" }} className="capitalize">{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1.5">File URL</label>
                <input className="input" value={form.fileUrl} onChange={e => setForm(f => ({ ...f, fileUrl: e.target.value }))} placeholder="https://…" type="url" />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1.5">External URL</label>
                <input className="input" value={form.externalUrl} onChange={e => setForm(f => ({ ...f, externalUrl: e.target.value }))} placeholder="https://…" type="url" />
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1.5">Tags</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {form.tags.map(t => (
                    <span key={t} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-indigo-950/60 text-indigo-300">
                      {t}
                      <button onClick={() => setForm(f => ({ ...f, tags: f.tags.filter(x => x !== t) }))}><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    className="input flex-1"
                    placeholder="Add tag and press Enter"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                  />
                  <Button variant="secondary" size="sm" onClick={addTag}>Add</Button>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-[var(--muted-foreground)] block mb-1.5">Region (optional)</label>
                <input className="input" value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))} placeholder="e.g. Japan, Tokyo, Nationwide" />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[var(--border)]">
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleSave} loading={saving} disabled={!form.title}>
                {saved ? <><Check className="w-4 h-4" /> Saved</> : editingId ? "Save Changes" : "Add Resource"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteId(null)} />
          <div className="relative bg-[var(--surface-raised)] rounded-xl border border-[var(--border)] p-6 w-full max-w-sm shadow-2xl">
            <h3 className="font-semibold mb-2">Delete Resource?</h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-5">
              This permanently removes the resource from the library. This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setDeleteId(null)}>Cancel</Button>
              <Button
                onClick={() => handleDelete(deleteId)}
                loading={actionLoading === deleteId}
                className="bg-red-600 hover:bg-red-500"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
