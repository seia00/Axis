import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { ventureStage } = await req.json();
  if (!["accepted", "rejected", "mentoring", "launched"].includes(ventureStage)) {
    return NextResponse.json({ error: "Invalid ventureStage" }, { status: 400 });
  }

  const updated = await prisma.project.update({
    where: { id: params.id },
    data: { ventureStage },
  });

  return NextResponse.json(updated);
}
