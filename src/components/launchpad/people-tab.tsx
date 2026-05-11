"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSession, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Globe, UserCheck, Clock, UserPlus, ChevronDown } from "lucide-react";

type RequestStatus = "pending_sent" | "pending_received" | "accepted" | null;

interface BrowseUser {
  id:              string;
  displayName:     string;
  skills:          string[];
  interests:       string[];
  goals:           string[];
  experienceLevel: string;
  requestStatus:   RequestStatus;
  twitterHandle?:  string | null;
  instagramHandle?: string | null;
  linkedinUrl?:    string | null;
  websiteUrl?:     string | null;
}

interface IncomingRequest {
  id:          string;
  fromUserId:  string;
  displayName: string;
  skills:      string[];
  interests:   string[];
  createdAt:   string;
}

const LEVEL_LABEL: Record<string, string> = {
  beginner:     "Beginner",
  intermediate: "Intermediate",
  advanced:     "Advanced",
  expert:       "Expert",
};

const LEVEL_COLOR: Record<string, string> = {
  beginner:     "bg-green-950/50 text-green-400 border-green-800/40",
  intermediate: "bg-blue-950/50 text-blue-400 border-blue-800/40",
  advanced:     "bg-violet-950/50 text-violet-400 border-violet-800/40",
  expert:       "bg-amber-950/50 text-amber-400 border-amber-800/40",
};

function InitialsAvatar({ name }: { name: string }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="w-10 h-10 rounded-full bg-violet-950/60 border border-violet-800/40 flex items-center justify-center flex-shrink-0">
      <span className="text-sm font-bold text-violet-300">{initials}</span>
    </div>
  );
}

function ConnectButton({
  userId,
  status,
  onStatusChange,
}: {
  userId: string;
  status: RequestStatus;
  onStatusChange: (id: string, s: RequestStatus) => void;
}) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    if (!session) { signIn(); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ toUserId: userId }),
      });
      if (res.ok || res.status === 409) {
        onStatusChange(userId, "pending_sent");
      }
    } finally {
      setLoading(false);
    }
  };

  if (status === "accepted") {
    return (
      <span className="flex items-center gap-1 text-xs text-green-400 font-medium">
        <UserCheck className="w-3.5 h-3.5" /> Connected
      </span>
    );
  }
  if (status === "pending_sent") {
    return (
      <span className="flex items-center gap-1 text-xs text-[var(--muted-foreground)]">
        <Clock className="w-3.5 h-3.5" /> Pending
      </span>
    );
  }
  if (status === "pending_received") {
    return (
      <span className="text-xs text-violet-400 font-medium">Wants to connect</span>
    );
  }
  return (
    <Button size="sm" variant="secondary" onClick={handleConnect} loading={loading}
      className="flex items-center gap-1 text-xs h-7 px-2.5">
      <UserPlus className="w-3.5 h-3.5" />
      Connect
    </Button>
  );
}

function SocialLinks({ user }: { user: BrowseUser }) {
  const links = [
    user.twitterHandle   ? { href: `https://twitter.com/${user.twitterHandle}`,   label: "𝕏" }          : null,
    user.instagramHandle ? { href: `https://instagram.com/${user.instagramHandle}`, label: "IG" }        : null,
    user.linkedinUrl     ? { href: user.linkedinUrl,  label: "in" }                                      : null,
    user.websiteUrl      ? { href: user.websiteUrl,   label: <Globe className="w-3.5 h-3.5" /> }         : null,
  ].filter(Boolean) as { href: string; label: React.ReactNode }[];

  if (links.length === 0) {
    return <p className="text-xs text-[var(--muted-foreground)] mt-2">No social links added.</p>;
  }
  return (
    <div className="flex items-center gap-2 mt-2">
      {links.map(({ href, label }, i) => (
        <a key={i} href={href} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center w-7 h-7 rounded-full border border-[var(--border)] text-xs font-bold text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:border-violet-500/50 transition-colors">
          {label}
        </a>
      ))}
    </div>
  );
}

export function PeopleTab() {
  const { data: session } = useSession();
  const [users, setUsers]           = useState<BrowseUser[]>([]);
  const [page, setPage]             = useState(1);
  const [hasMore, setHasMore]       = useState(true);
  const [loading, setLoading]       = useState(true);
  const [incoming, setIncoming]     = useState<IncomingRequest[]>([]);
  const [actionLoading, setAction]  = useState<Record<string, boolean>>({});

  const loadUsers = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/browse?page=${p}`);
      const data = await res.json();
      if (p === 1) setUsers(data.users ?? []);
      else setUsers(prev => [...prev, ...(data.users ?? [])]);
      setHasMore((data.users ?? []).length === data.pageSize);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUsers(1); }, [loadUsers]);

  useEffect(() => {
    if (!session) return;
    fetch("/api/connect")
      .then(r => r.json())
      .then(data => setIncoming(Array.isArray(data) ? data : []));
  }, [session]);

  const handleStatusChange = (userId: string, status: RequestStatus) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, requestStatus: status } : u));
  };

  const handleRequestAction = async (reqId: string, action: "accept" | "reject") => {
    setAction(prev => ({ ...prev, [reqId]: true }));
    try {
      await fetch("/api/connect", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: reqId, action }),
      });
      setIncoming(prev => prev.filter(r => r.id !== reqId));
      if (action === "accept") {
        // Reload to get updated statuses
        loadUsers(1);
        setPage(1);
      }
    } finally {
      setAction(prev => ({ ...prev, [reqId]: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Incoming requests strip */}
      {session && incoming.length > 0 && (
        <div className="card border-violet-800/30 bg-violet-950/10">
          <h3 className="text-sm font-semibold text-violet-300 mb-3 flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Connection requests ({incoming.length})
          </h3>
          <div className="space-y-3">
            {incoming.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 min-w-0">
                  <InitialsAvatar name={r.displayName} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--foreground)] truncate">{r.displayName}</p>
                    {r.skills.length > 0 && (
                      <p className="text-xs text-[var(--muted-foreground)] truncate">
                        {r.skills.slice(0, 3).join(" · ")}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button size="sm" variant="secondary"
                    className="h-7 px-3 text-xs border-red-800/40 text-red-400 hover:bg-red-950/30"
                    loading={actionLoading[r.id]}
                    onClick={() => handleRequestAction(r.id, "reject")}>
                    Decline
                  </Button>
                  <Button size="sm" className="h-7 px-3 text-xs"
                    loading={actionLoading[r.id]}
                    onClick={() => handleRequestAction(r.id, "accept")}>
                    Accept
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Browse grid */}
      {loading && users.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card animate-pulse h-44" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted-foreground)]">
          <p className="text-base">No users found.</p>
          <p className="text-sm mt-1">Be the first to complete your profile!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((u) => (
            <div key={u.id} className="card flex flex-col gap-3">
              {/* Header */}
              <div className="flex items-start gap-3">
                <InitialsAvatar name={u.displayName} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--foreground)] truncate">{u.displayName}</p>
                  <span className={`inline-block mt-0.5 text-xs px-2 py-0.5 rounded-full border ${LEVEL_COLOR[u.experienceLevel] ?? LEVEL_COLOR.beginner}`}>
                    {LEVEL_LABEL[u.experienceLevel] ?? u.experienceLevel}
                  </span>
                </div>
                <ConnectButton userId={u.id} status={u.requestStatus} onStatusChange={handleStatusChange} />
              </div>

              {/* Skills */}
              {u.skills.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {u.skills.slice(0, 4).map(s => (
                    <span key={s} className="px-2 py-0.5 text-xs rounded-full bg-indigo-950/40 text-indigo-300 border border-indigo-800/30">
                      {s}
                    </span>
                  ))}
                  {u.skills.length > 4 && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--surface-overlay)] text-[var(--muted-foreground)] border border-[var(--border)]">
                      +{u.skills.length - 4}
                    </span>
                  )}
                </div>
              )}

              {/* Interests */}
              {u.interests.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {u.interests.slice(0, 3).map(i => (
                    <span key={i} className="px-2 py-0.5 text-xs rounded-full bg-violet-950/30 text-violet-300 border border-violet-800/30">
                      {i}
                    </span>
                  ))}
                </div>
              )}

              {/* Socials (only when connected) */}
              {u.requestStatus === "accepted" && <SocialLinks user={u} />}
            </div>
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && !loading && users.length > 0 && (
        <div className="flex justify-center pt-2">
          <Button variant="secondary" onClick={() => { const next = page + 1; setPage(next); loadUsers(next); }}
            className="flex items-center gap-2">
            <ChevronDown className="w-4 h-4" />
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
