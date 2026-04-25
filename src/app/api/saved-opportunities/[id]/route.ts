import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const saved = await prisma.savedOpportunity.findUnique({ where: { id: params.id } });
  if (!saved) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (saved.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { status, notes } = await req.json();
  const updated = await prisma.savedOpportunity.update({
    where: { id: params.id },
    data: { status, notes },
  });

  return NextResponse.json(updated);
}
