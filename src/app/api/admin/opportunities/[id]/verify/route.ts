import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const reject = body.reject === true;

  if (reject) {
    // Mark as reviewed by deleting (or we could add a "rejected" field)
    await prisma.opportunity.delete({ where: { id: params.id } });
    return NextResponse.json({ deleted: true });
  }

  const updated = await prisma.opportunity.update({
    where: { id: params.id },
    data: { isVerified: true, verifiedAt: new Date() },
  });

  return NextResponse.json(updated);
}
