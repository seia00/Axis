"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Plus, Rocket, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal, StaggerContainer, StaggerItem } from "@/components/animation";
import { motion } from "framer-motion";

const STAGES = ["idea", "building", "launched", "scaling"];
const CATEGORIES = ["technology", "social impact", "education", "health", "environment", "arts", "business", "other"];

const STAGE_COLORS: Record<string, string> = {
  idea: "bg-amber-950/60 text-amber-300 border border-amber-800/40",
  building: "bg-blue-950/60 text-blue-300 border border-blue-800/40",
  launched: "bg-emerald-950/60 text-emerald-300 border border-emerald-800/40",
  scaling: "bg-violet-950/60 text-violet-300 border border-violet-800/40",
};

interface Project {
  id: string;
  title: string;
  tagline?: string;
  description: string;
  stage: string;
  category: string;
  tags: string[];
  openRolesCount: number;
  creator: { id: string; name?: string; image?: string };
}

export default function LaunchpadPage() {
  const { status } = useSession();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStage, setFilterStage] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const fetchProjects = useCallback(async () => {
    const params = new URLSearchParams();
    if (filterStage) params.set("stage", filterStage);
    if (filterCategory) params.set("category", filterCategory);
    const res = await fetch(`/api/projects?${params}`);
    if (res.ok) setProjects(await res.json());
    setLoading(false);
  }, [filterStage, filterCategory]);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/auth/signin?callbackUrl=/launchpad");
    if (status === "authenticated") fetchProjects();
  }, [status, router, fetchProjects]);

  useEffect(() => {
    if (status === "authenticated") fetchProjects();
  }, [filterStage, filterCategory, status, fetchProjects]);

  if (status === "loading") return <div className="min-h-screen"><div className="flex items-center justify-center mt-32"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div></div>;

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <Reveal>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Launch Pad</h1>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">Find your team, or find your next project</p>
            </div>
          </Reveal>
          <Link href="/launchpad/create">
            <Button size="sm">
              <Plus className="w-4 h-4" /> New Project
            </Button>
          </Link>
        </div>

        <div className="flex gap-6">
          {/* Filters */}
          <aside className="w-52 flex-shrink-0 space-y-5">
            <div>
              <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Stage</p>
              <div className="space-y-1">
                <button onClick={() => setFilterStage("")} className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${!filterStage ? "bg-indigo-600/10 text-indigo-400" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-raised)]"}`}>All Stages</button>
                {STAGES.map(s => (
                  <button key={s} onClick={() => setFilterStage(s === filterStage ? "" : s)} className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors capitalize ${filterStage === s ? "bg-indigo-600/10 text-indigo-400" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-raised)]"}`}>{s}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">Category</p>
              <div className="space-y-1">
                <button onClick={() => setFilterCategory("")} className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors ${!filterCategory ? "bg-indigo-600/10 text-indigo-400" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-raised)]"}`}>All Categories</button>
                {CATEGORIES.map(c => (
                  <button key={c} onClick={() => setFilterCategory(c === filterCategory ? "" : c)} className={`w-full text-left text-sm px-2 py-1.5 rounded-lg transition-colors capitalize ${filterCategory === c ? "bg-indigo-600/10 text-indigo-400" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--surface-raised)]"}`}>{c}</button>
                ))}
              </div>
            </div>
          </aside>

          {/* Projects Grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>
            ) : projects.length === 0 ? (
              <div className="card text-center py-12">
                <Rocket className="w-10 h-10 text-[var(--muted-foreground)] mx-auto mb-3" />
                <p className="text-[var(--muted-foreground)] mb-4">No projects yet. Be the first to launch!</p>
                <Link href="/launchpad/create"><Button size="sm"><Plus className="w-4 h-4" /> Create Project</Button></Link>
              </div>
            ) : (
              <StaggerContainer className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map(project => (
                  <StaggerItem key={project.id}>
                  <motion.div
                    whileHover={{ y: -3, boxShadow: "0 12px 28px rgba(0,0,0,0.25)" }}
                    transition={{ duration: 0.2 }}
                  >
                  <Link
                    href={`/launchpad/${project.id}`}
                    className="card hover:border-indigo-500/30 transition-all flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${STAGE_COLORS[project.stage] ?? "bg-zinc-800 text-zinc-300"}`}>
                        {project.stage}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--surface-raised)] text-[var(--muted-foreground)] capitalize">
                        {project.category}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{project.title}</h3>
                    {project.tagline && <p className="text-xs text-indigo-300 mb-2">{project.tagline}</p>}
                    <p className="text-xs text-[var(--muted-foreground)] line-clamp-3 flex-1">{project.description}</p>
                    <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {project.creator?.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={project.creator.image} alt="" className="w-5 h-5 rounded-full" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-indigo-600/30 flex items-center justify-center">
                            <Users className="w-3 h-3 text-indigo-400" />
                          </div>
                        )}
                        <span className="text-xs text-[var(--muted-foreground)]">{project.creator?.name ?? "Anonymous"}</span>
                      </div>
                      {project.openRolesCount > 0 && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-600/10 text-indigo-400 border border-indigo-600/20">
                          {project.openRolesCount} open role{project.openRolesCount !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </Link>
                  </motion.div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
