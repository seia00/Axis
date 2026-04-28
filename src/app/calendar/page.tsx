"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft, ChevronRight, Plus, Loader2, X, Calendar as CalendarIcon,
  ExternalLink
} from "lucide-react";
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths
} from "date-fns";

const TYPE_COLORS: Record<string, string> = {
  deadline: "#ef4444",
  event: "#8b5cf6",
  personal: "#3b82f6",
  program: "#10b981",
  other: "#6366f1",
};

interface CalEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  endDate?: string;
  type: string;
  url?: string;
  color?: string;
  isGlobal: boolean;
}

export default function CalendarPage() {
  const { status } = useSession();
  const router = useRouter();
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalEvent | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", date: "", type: "personal", url: "" });
  const [saving, setSaving] = useState(false);

  const fetchEvents = useCallback(async () => {
    const res = await fetch("/api/calendar");
    if (res.ok) setEvents(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin?callbackUrl=/calendar");
    if (status === "authenticated") fetchEvents();
  }, [status, router, fetchEvents]);

  const handleAddEvent = async () => {
    setSaving(true);
    const res = await fetch("/api/calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      await fetchEvents();
      setShowAddModal(false);
      setForm({ title: "", description: "", date: "", type: "personal", url: "" });
    }
    setSaving(false);
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const calDays = eachDayOfInterval({ start: calStart, end: calEnd });

  const getEventsForDay = (day: Date) =>
    events.filter(e => isSameDay(new Date(e.date), day));

  const upcoming = events
    .filter(e => new Date(e.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 10);

  if (status === "loading") return <div className="min-h-screen"><div className="flex items-center justify-center mt-32"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div></div>;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">My Calendar</h1>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">Your deadlines, events, and milestones in one place</p>
          </div>
          <Button size="sm" onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4" /> Add Event
          </Button>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-3">
            <div className="card">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCurrentMonth(m => subMonths(m, 1))}
                  className="p-1.5 rounded-lg hover:bg-[var(--surface-raised)] transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <h2 className="text-base font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>
                <button
                  onClick={() => setCurrentMonth(m => addMonths(m, 1))}
                  className="p-1.5 rounded-lg hover:bg-[var(--surface-raised)] transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 mb-1">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                  <div key={d} className="text-center text-xs font-medium text-[var(--muted-foreground)] py-2">{d}</div>
                ))}
              </div>

              {/* Calendar Cells */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                </div>
              ) : (
                <div className="grid grid-cols-7">
                  {calDays.map(day => {
                    const dayEvents = getEventsForDay(day);
                    const inMonth = isSameMonth(day, currentMonth);
                    const today = isToday(day);
                    return (
                      <div
                        key={day.toISOString()}
                        className={`min-h-[80px] p-1 border-t border-[var(--border)] ${inMonth ? "" : "opacity-30"}`}
                      >
                        <p className={`text-xs text-right mb-1 w-6 h-6 flex items-center justify-center rounded-full ml-auto ${today ? "bg-indigo-600 text-white font-bold" : "text-[var(--muted-foreground)]"}`}>
                          {format(day, "d")}
                        </p>
                        <div className="space-y-0.5">
                          {dayEvents.slice(0, 3).map(event => (
                            <button
                              key={event.id}
                              onClick={() => setSelectedEvent(event)}
                              className="w-full text-left text-xs px-1.5 py-0.5 rounded truncate"
                              style={{
                                backgroundColor: `${event.color ?? TYPE_COLORS[event.type] ?? "#6366f1"}20`,
                                color: event.color ?? TYPE_COLORS[event.type] ?? "#6366f1",
                              }}
                            >
                              {event.title}
                            </button>
                          ))}
                          {dayEvents.length > 3 && (
                            <p className="text-xs text-[var(--muted-foreground)] px-1">+{dayEvents.length - 3} more</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Sidebar */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-[var(--muted-foreground)] uppercase tracking-wider">Upcoming</h3>
            {upcoming.length === 0 ? (
              <div className="card text-center py-8">
                <CalendarIcon className="w-8 h-8 text-[var(--muted-foreground)] mx-auto mb-2" />
                <p className="text-xs text-[var(--muted-foreground)]">No upcoming events</p>
              </div>
            ) : (
              <div className="space-y-2">
                {upcoming.map(event => (
                  <button
                    key={event.id}
                    onClick={() => setSelectedEvent(event)}
                    className="w-full text-left card p-3 hover:border-indigo-500/30 transition-all"
                  >
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: event.color ?? TYPE_COLORS[event.type] ?? "#6366f1" }} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{event.title}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{format(new Date(event.date), "MMM d, yyyy")}</p>
                        <span className="text-xs px-1.5 py-0.5 rounded-full capitalize" style={{ backgroundColor: `${event.color ?? TYPE_COLORS[event.type] ?? "#6366f1"}20`, color: event.color ?? TYPE_COLORS[event.type] ?? "#6366f1" }}>
                          {event.type}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Event Detail Popover */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSelectedEvent(null)} />
          <div className="relative bg-[var(--surface-raised)] rounded-xl border border-[var(--border)] w-full max-w-sm p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex items-start gap-2.5">
                <div className="w-3 h-3 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: selectedEvent.color ?? TYPE_COLORS[selectedEvent.type] ?? "#6366f1" }} />
                <div>
                  <h3 className="font-semibold">{selectedEvent.title}</h3>
                  <p className="text-xs text-[var(--muted-foreground)]">{format(new Date(selectedEvent.date), "MMMM d, yyyy")}</p>
                </div>
              </div>
              <button onClick={() => setSelectedEvent(null)}><X className="w-4 h-4 text-[var(--muted-foreground)]" /></button>
            </div>
            {selectedEvent.description && <p className="text-sm text-[var(--muted-foreground)] mb-3">{selectedEvent.description}</p>}
            {selectedEvent.url && (
              <a href={selectedEvent.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                <ExternalLink className="w-3.5 h-3.5" /> Open link
              </a>
            )}
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-[var(--surface-raised)] rounded-xl border border-[var(--border)] w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold">Add Event</h2>
              <button onClick={() => setShowAddModal(false)}><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <input className="input" placeholder="Event title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              <textarea className="input min-h-[60px]" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              <div>
                <label className="text-xs text-[var(--muted-foreground)] block mb-1">Date *</label>
                <input className="input" type="datetime-local" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
              </div>
              <select className="input" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {["personal", "deadline", "event", "program"].map(t => <option key={t} value={t} style={{ background: "var(--surface-raised)" }} className="capitalize">{t}</option>)}
              </select>
              <input className="input" placeholder="URL (optional)" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-[var(--border)]">
              <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button onClick={handleAddEvent} loading={saving} disabled={!form.title || !form.date}>Add Event</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
