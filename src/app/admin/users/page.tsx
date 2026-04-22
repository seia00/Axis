import { prisma } from "@/lib/prisma";
import { AdminUserRow } from "@/components/admin/user-row";
import { Users } from "lucide-react";

export const metadata = { title: "User Management" };

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true, name: true, email: true, role: true,
      school: true, banned: true, createdAt: true,
      orgsLed: { select: { name: true, slug: true }, take: 1 },
    },
  });

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-5 h-5 text-indigo-400" />
        <h1 className="text-2xl font-bold tracking-tight">User Management</h1>
        <span className="text-sm text-[var(--muted-foreground)] ml-2">({users.length} users)</span>
      </div>

      <div className="rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface-raised)]">
                {["User", "Role", "School", "Org", "Joined", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {users.map((user) => (
                <AdminUserRow key={user.id} user={user} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
