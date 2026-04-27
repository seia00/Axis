import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { format } from "date-fns";
import { User, Clock, Users, Trophy, Briefcase, Code2, Heart, BookOpen, Star, Globe } from "lucide-react";
import { XIcon, InstagramIcon, LinkedInIcon } from "@/components/ui/brand-icons";

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

export async function generateMetadata({ params }: { params: { username: string } }) {
  return { title: `${params.username}'s Portfolio | AXIS` };
}

export default async function PublicPortfolioPage({ params }: { params: { username: string } }) {
  // Find user by username or email prefix
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: params.username },
        { email: { startsWith: params.username + "@" } },
      ],
    },
  });

  if (!user) notFound();

  const activities = await prisma.activity.findMany({
    where: { userId: user.id },
    orderBy: { startDate: "desc" },
  });

  const totalHours = activities.reduce((sum, a) => sum + (a.hoursPerWeek ?? 0), 0);
  const totalPeople = activities.reduce((sum, a) => sum + (a.peopleReached ?? 0), 0);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="card mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-600/20 border border-indigo-600/30 flex items-center justify-center flex-shrink-0">
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="w-7 h-7 text-indigo-400" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold">{user.name ?? params.username}</h1>
                {user.isVerified && (
                  <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800/40">
                    <Star className="w-3 h-3" /> Verified
                  </span>
                )}
              </div>
              {user.headline && <p className="text-sm text-indigo-300 mt-0.5">{user.headline}</p>}
              <div className="flex items-center gap-3 flex-wrap mt-1">
                {user.location && <p className="text-xs text-[var(--muted-foreground)]">{user.location}</p>}
                {user.school && <p className="text-xs text-[var(--muted-foreground)]">· {user.school}</p>}
              </div>
              {user.bio && <p className="text-sm text-[var(--muted-foreground)] mt-2 max-w-lg leading-relaxed">{user.bio}</p>}

              {/* Social links */}
              {(user.twitterHandle || user.instagramHandle || user.linkedinUrl || user.websiteUrl) && (
                <div className="flex items-center gap-3 mt-3 flex-wrap">
                  {user.twitterHandle && (
                    <a
                      href={`https://twitter.com/${user.twitterHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-sky-400 transition-colors"
                    >
                      <XIcon className="w-3.5 h-3.5" />
                      @{user.twitterHandle}
                    </a>
                  )}
                  {user.instagramHandle && (
                    <a
                      href={`https://instagram.com/${user.instagramHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-pink-400 transition-colors"
                    >
                      <InstagramIcon className="w-3.5 h-3.5" />
                      @{user.instagramHandle}
                    </a>
                  )}
                  {user.linkedinUrl && (
                    <a
                      href={user.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-blue-400 transition-colors"
                    >
                      <LinkedInIcon className="w-3.5 h-3.5" />
                      LinkedIn
                    </a>
                  )}
                  {user.websiteUrl && (
                    <a
                      href={user.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-emerald-400 transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      Website
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

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

        {/* Activity Timeline */}
        <h2 className="text-lg font-semibold mb-4">Activities</h2>
        {activities.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-[var(--muted-foreground)]">No activities yet.</p>
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
                    <div className="card">
                      <div className="flex items-start gap-2">
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
                            <p className="text-xs text-[var(--muted-foreground)] mt-1.5">{activity.description}</p>
                          )}
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${color}20`, color }}>
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
                              <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-indigo-950/60 text-indigo-300">{t}</span>
                            ))}
                          </div>
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
    </div>
  );
}
