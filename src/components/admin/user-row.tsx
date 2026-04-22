"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Role } from "@prisma/client";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface UserRowProps {
  user: {
    id: string;
    name: string | null;
    email: string | null;
    role: Role;
    school: string | null;
    banned: boolean;
    createdAt: Date;
    orgsLed: { name: string; slug: string }[];
  };
}

export function AdminUserRow({ user }: UserRowProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const updateUser = async (updates: Partial<{ role: Role; banned: boolean }>) => {
    setLoading(true);
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id, ...updates }),
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <tr className={`hover:bg-[var(--surface-raised)] transition-colors ${user.banned ? "opacity-50" : ""}`}>
      <td className="px-4 py-3">
        <div>
          <p className="font-medium text-xs">{user.name ?? "—"}</p>
          <p className="text-xs text-[var(--muted-foreground)]">{user.email}</p>
        </div>
      </td>
      <td className="px-4 py-3">
        <select
          value={user.role}
          onChange={(e) => updateUser({ role: e.target.value as Role })}
          disabled={loading}
          className="text-xs bg-[var(--surface)] border border-[var(--border)] rounded px-2 py-1 text-[var(--foreground)] focus:outline-none"
        >
          <option value="STUDENT">Student</option>
          <option value="ORG_LEADER">Org Leader</option>
          <option value="ADMIN">Admin</option>
        </select>
      </td>
      <td className="px-4 py-3 text-xs text-[var(--muted-foreground)]">{user.school ?? "—"}</td>
      <td className="px-4 py-3 text-xs">
        {user.orgsLed[0] ? (
          <Link href={`/directory/${user.orgsLed[0].slug}`} className="text-indigo-400 hover:text-indigo-300">
            {user.orgsLed[0].name}
          </Link>
        ) : "—"}
      </td>
      <td className="px-4 py-3 text-xs text-[var(--muted-foreground)]">{formatDate(user.createdAt)}</td>
      <td className="px-4 py-3">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          user.banned
            ? "bg-red-950/60 text-red-300 border border-red-800/40"
            : "bg-emerald-950/60 text-emerald-300 border border-emerald-800/40"
        }`}>
          {user.banned ? "Banned" : "Active"}
        </span>
      </td>
      <td className="px-4 py-3">
        <button
          onClick={() => updateUser({ banned: !user.banned })}
          disabled={loading}
          className="text-xs text-[var(--muted-foreground)] hover:text-red-400 transition-colors"
        >
          {user.banned ? "Unban" : "Ban"}
        </button>
      </td>
    </tr>
  );
}
