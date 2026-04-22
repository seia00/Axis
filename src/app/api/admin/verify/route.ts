import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { OrgTier } from "@prisma/client";

const schema = z.object({
  applicationId: z.string(),
  action: z.enum(["approve", "reject"]),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });

  const { applicationId, action } = parsed.data;

  const application = await prisma.verificationApplication.findUnique({
    where: { id: applicationId },
    include: { org: true },
  });

  if (!application) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.verificationApplication.update({
    where: { id: applicationId },
    data: {
      status: action === "approve" ? "approved" : "rejected",
      reviewedAt: new Date(),
      reviewedBy: session.user.id,
    },
  });

  if (action === "approve") {
    await prisma.organization.update({
      where: { id: application.orgId },
      data: {
        tier: application.targetTier as OrgTier,
        verified: application.targetTier === "VERIFIED" || application.targetTier === "PARTNER",
      },
    });
  }

  if (process.env.RESEND_API_KEY) {
    const orgLeader = await prisma.user.findUnique({ where: { id: application.org.leaderId } });
    if (orgLeader?.email) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.EMAIL_FROM ?? "noreply@axis.community",
        to: orgLeader.email,
        subject: action === "approve"
          ? `Congratulations! ${application.org.name} is now ${application.targetTier} on AXIS`
          : `Update on your AXIS verification application`,
        html: action === "approve"
          ? `<p>Your organization <strong>${application.org.name}</strong> has been awarded <strong>AXIS ${application.targetTier}</strong> status. Congratulations!</p>`
          : `<p>Your verification application for <strong>${application.org.name}</strong> was not approved at this time. You can reapply after addressing the feedback.</p>`,
      });
    }
  }

  return NextResponse.json({ success: true });
}
