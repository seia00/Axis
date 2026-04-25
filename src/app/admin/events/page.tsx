"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Calendar, Loader2, X } from "lucide-react";
import { format } from "date-fns";

interface CalEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  endDate?: string;
  type: string;
  url?: string;
  color?: string;
}

const TYPE_COLORS: Record<string, string> = {
  deadline: "#ef4444",
  event: "#8b5cf6",
  personal: "#3b82f6",
  program: "#10b981",
  other: "#6366f1",
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", date: "", endDate: "", type: "event", url: "", color: "" });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    const res = await fetch("/api/admin/events");
    if (res.ok) setEvents(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleCreate = async () => {
    if (!form.title || !form.date || !form.type) return;
    setSaving(true);
    const res = await fetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      await fetchEvents();
      setShowForm(false);
      setForm({ title: "", description: "", date: "", endDate: "", type: "event", url: "", color: "" });
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this global event?")) return;
    setDeletingId(id);
    await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
    setEvents(prev => prev.filter(e => e.id !== id));
    setDeletingId(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Global Events</h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-1">Events visible to all users on their calendar</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" /> Add Global Event
        </Button>
      </div>

      {showForm && (
        <div className="card mb-6 border-indigo-500/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold">New Global Event</h2>
            <button onClick={() => setShowForm(false)}><X className="w-4 h-4" /></button>
          </div>
          <div className="space-y-3">
            <input
              className="input"
              placeholder="Title *"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
            <textarea
              className="input min-h-[60px]"
              placeholder="Description"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-[var(--muted-foreground)] block mb-1">Date *</label>
                <input
                  className="input"
                  type="datetime-local"
                  value={form.date}
                  onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-[var(--muted-foreground)] block mb-1">End Date</label>
                <input
                  className="input"
                  type="datetime-local"
                  value={form.endDate}
                  onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select
                className="input"
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              >
                {["event", "deadline", "program", "personal", "other"].map(t => (
                  <option key={t} value={t} style={{ background: "var(--surface-raised)" }} className="capitalize">{t}</option>
                ))}
              </select>
              <input
                className="input"
                placeholder="URL (optional)"
                value={form.url}
                onChange={e => setForm(f => ({ ...f, url: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[var(--border)]">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={saving} disabled={!form.title || !form.date}>
              Create Global Event
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
        </div>
      ) : events.length === 0 ? (
        <div className="card text-center py-12">
          <Calendar className="w-10 h-10 text-[var(--muted-foreground)] mx-auto mb-3" />
          <p className="text-[var(--muted-foreground)]">No global events yet. Create one to make it visible to all users.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map(event => (
            <div key={event.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                    style={{ backgroundColor: event.color ?? TYPE_COLORS[event.type] ?? "#6366f1" }}
                  />
                  <div>
                    <h3 className="font-medium">{event.title}</h3>
                    {event.description && (
                      <p className="text-sm text-[var(--muted-foreground)] mt-0.5">{event.description}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {format(new Date(event.date), "MMM d, yyyy HH:mm")}
                      </span>
                      {event.endDate && (
                        <span className="text-xs text-[var(--muted-foreground)]">
                          → {format(new Date(event.endDate), "MMM d, yyyy HH:mm")}
                        </span>
                      )}
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full capitalize"
                        style={{
                          backgroundColor: `${event.color ?? TYPE_COLORS[event.type] ?? "#6366f1"}20`,
                          color: event.color ?? TYPE_COLORS[event.type] ?? "#6366f1",
                        }}
                      >
                        {event.type}
                      </span>
                    </div>
                    {event.url && (
                      <a
                        href={event.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-400 hover:text-indigo-300 mt-1 block"
                      >
                        {event.url}
                      </a>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(event.id)}
                  disabled={deletingId === event.id}
                  className="p-1.5 rounded-lg hover:bg-red-950/20 text-[var(--muted-foreground)] hover:text-red-400 transition-colors flex-shrink-0"
                >
                  {deletingId === event.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
