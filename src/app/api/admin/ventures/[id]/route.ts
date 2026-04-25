import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const { ventureStage, mentorAssigned } = body;
  if (!["accepted", "rejected", "mentoring", "launched"].includes(ventureStage)) {
    return NextResponse.json({ error: "Invalid ventureStage" }, { status: 400 });
  }

  const updated = await prisma.project.update({
    where: { id: params.id },
    data: {
      ventureStage,
      ...(mentorAssigned !== undefined ? { mentorAssigned } : {}),
    },
  });

  // Send email notification to creator
  if (process.env.RESEND_API_KEY) {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: { creator: { select: { email: true, name: true } } },
    });
    if (project?.creator?.email) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      const isAccepted = ventureStage === "accepted";
      await resend.emails.send({
        from: process.env.EMAIL_FROM ?? "noreply@axis.community",
        to: project.creator.email,
        subject: isAccepted
          ? `Congratulations! Your project "${project.title}" has been accepted to AXIS Ventures`
          : `Update on your AXIS Ventures application for "${project.title}"`,
        html: isAccepted
          ? `<p>Hi ${project.creator.name ?? "there"},</p><p>Your project <strong>${project.title}</strong> has been accepted into AXIS Ventures! ${mentorAssigned ? `Your assigned mentor is <strong>${mentorAssigned}</strong>.` : "A mentor will be assigned to you soon."}</p><p>Log in to your <a href="https://axis.community/ventures/dashboard">Ventures Dashboard</a> to get started.</p>`
          : `<p>Hi ${project.creator.name ?? "there"},</p><p>Thank you for applying to AXIS Ventures with your project <strong>${project.title}</strong>. Unfortunately, we are unable to move forward at this time. We encourage you to continue building and reapply in the future.</p>`,
      }).catch(console.error);
    }
  }

  return NextResponse.json(updated);
}
