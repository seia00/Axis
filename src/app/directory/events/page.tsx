export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Calendar, MapPin, ExternalLink } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "Events Calendar" };

export default async function EventsPage() {
  const events = await prisma.event.findMany({
    where: { date: { gte: new Date() } },
    orderBy: { date: "asc" },
    include: { org: { select: { name: true, slug: true, tier: true } } },
    take: 50,
  });

  const grouped = events.reduce((acc, event) => {
    const month = new Date(event.date).toLocaleDateString("en-US", { month: "long", year: "numeric" });
    if (!acc[month]) acc[month] = [];
    acc[month].push(event);
    return acc;
  }, {} as Record<string, typeof events>);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="w-5 h-5 text-indigo-400" />
          <h1 className="text-2xl font-bold tracking-tight">Events Calendar</h1>
        </div>
        <p className="text-sm text-[var(--muted-foreground)] mb-8">
          Upcoming events from all AXIS member organizations
        </p>

        {Object.keys(grouped).length === 0 ? (
          <div className="text-center py-16 text-[var(--muted-foreground)]">
            No upcoming events. Check back soon!
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(grouped).map(([month, monthEvents]) => (
              <div key={month}>
                <h2 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-4">
                  {month}
                </h2>
                <div className="space-y-3">
                  {monthEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex gap-4 p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:border-indigo-500/30 transition-all"
                    >
                      <div className="w-12 h-12 rounded-lg bg-indigo-950/60 border border-indigo-800/30 flex flex-col items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-indigo-300">
                          {new Date(event.date).toLocaleDateString("en", { month: "short" })}
                        </span>
                        <span className="text-lg font-bold text-indigo-200 leading-none">
                          {new Date(event.date).getDate()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold">{event.title}</h3>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-[var(--muted-foreground)]">
                          <Link
                            href={`/directory/${event.org.slug}`}
                            className="text-indigo-400 hover:text-indigo-300 transition-colors"
                          >
                            {event.org.name}
                          </Link>
                          {event.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {event.location}
                            </span>
                          )}
                          {event.isOnline && <span className="text-emerald-400">Online</span>}
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1 line-clamp-1">
                          {event.description}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span className="text-xs text-[var(--muted-foreground)]">
                          {new Date(event.date).toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {event.registrationLink && (
                          <a
                            href={event.registrationLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary text-xs py-1 px-3 gap-1"
                          >
                            Register <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
