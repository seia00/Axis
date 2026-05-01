import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Role } from "@prisma/client";
import { requireAdmin, safeError } from "@/lib/security";

const updateSchema = z.object({
  userId: z.string().min(1).max(100),
  role:   z.nativeEnum(Role).optional(),
  banned: z.boolean().optional(),
});

export async function GET(_req: NextRequest) {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true, name: true, email: true, role: true,
        school: true, banned: true, createdAt: true,
      },
      take: 500,
    });

    return NextResponse.json(users);
  } catch (err) {
    return safeError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { session, error } = await requireAdmin();
    if (error) return error;

    const body = await req.json().catch(() => ({}));
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { userId, ...data } = parsed.data;

    // Self-protection: an admin cannot demote themselves or ban themselves —
    // prevents accidentally locking yourself out of the admin panel and
    // limits damage from a compromised admin account being used to lock out
    // other admins.
    if (userId === session.user.id) {
      if (data.role !== undefined && data.role !== "ADMIN") {
        return NextResponse.json(
          { error: "You cannot change your own role" },
          { status: 400 },
        );
      }
      if (data.banned === true) {
        return NextResponse.json(
          { error: "You cannot ban yourself" },
          { status: 400 },
        );
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, role: true, banned: true },
    });

    return NextResponse.json(user);
  } catch (err) {
    return safeError(err);
  }
}
