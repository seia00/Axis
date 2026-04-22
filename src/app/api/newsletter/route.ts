import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid email" }, { status: 400 });

  const { email } = parsed.data;

  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: {},
      create: { email },
    });

    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.EMAIL_FROM ?? "noreply@axis.community",
        to: email,
        subject: "Welcome to the AXIS community",
        html: `
          <div style="font-family: Inter, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; background: #0a0a0f; color: #f4f4f8;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 32px;">
              <div style="width: 28px; height: 28px; border-radius: 8px; background: #4f46e5; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px;">AX</div>
              <span style="font-weight: 600; font-size: 14px;">AXIS</span>
            </div>
            <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 16px;">You're in.</h1>
            <p style="font-size: 14px; color: #9ca3af; line-height: 1.6; margin-bottom: 24px;">
              Welcome to the AXIS community — Japan's infrastructure for student organizations. We'll keep you updated on new organizations, events, and platform developments.
            </p>
            <a href="https://axis.community/directory" style="display: inline-block; padding: 10px 20px; background: #4f46e5; color: white; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 500;">
              Browse the Directory →
            </a>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    if (e.code === "P2002") {
      return NextResponse.json({ message: "Already subscribed" });
    }
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
