import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const application = await prisma.application.findUnique({ where: { id: params.id } });
  if (!application) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Verify caller is the project creator
  const project = await prisma.project.findUnique({ where: { id: application.projectId } });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  if (project.creatorId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { status } = await req.json();
  if (!["accepted", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await prisma.application.update({
    where: { id: params.id },
    data: { status },
  });

  // Get applicant email
  const applicant = await prisma.user.findUnique({ where: { id: application.userId } });
  const resend = new Resend(process.env.RESEND_API_KEY);
  if (applicant?.email) {
    if (status === "accepted") {
      // Add as project member
      await prisma.projectMember.upsert({
        where: { userId_projectId: { userId: application.userId, projectId: application.projectId } },
        update: {},
        create: { userId: application.userId, projectId: application.projectId, role: "Member" },
      });
      // Mark role as filled
      if (application.roleId) {
        await prisma.role2.update({ where: { id: application.roleId }, data: { isFilled: true } });
      }
      // Send acceptance email
      await resend.emails.send({
        from: process.env.EMAIL_FROM ?? "noreply@axis.community",
        to: applicant.email,
        subject: `You've been accepted to ${project.title}!`,
        html: `<p>Hi ${applicant.name ?? "there"},</p><p>Great news! Your application to join <strong>${project.title}</strong> on AXIS Launch Pad has been <strong>accepted</strong>!</p><p>Head over to <a href="${process.env.NEXTAUTH_URL}/launchpad/${project.id}">the project page</a> to get started with your team.</p><p>– The AXIS Team</p>`,
      });
    } else {
      // Send rejection email
      await resend.emails.send({
        from: process.env.EMAIL_FROM ?? "noreply@axis.community",
        to: applicant.email,
        subject: `Application update for ${project.title}`,
        html: `<p>Hi ${applicant.name ?? "there"},</p><p>Thank you for applying to join <strong>${project.title}</strong> on AXIS Launch Pad. Unfortunately, the team has decided not to move forward with your application at this time.</p><p>Keep building — there are many other projects on <a href="${process.env.NEXTAUTH_URL}/launchpad">AXIS Launch Pad</a> looking for collaborators.</p><p>– The AXIS Team</p>`,
      });
    }
  }

  return NextResponse.json(updated);
}
