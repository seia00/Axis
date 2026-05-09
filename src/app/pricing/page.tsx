import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PricingContent } from "./pricing-content";

export const metadata = { title: "Pricing — AXIS" };

export default async function PricingPage() {
  const session = await getServerSession(authOptions);

  let currentPriceId: string | null = null;
  let subscriptionStatus: string | null = null;

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { priceId: true, subscriptionStatus: true },
    });
    currentPriceId = user?.priceId ?? null;
    subscriptionStatus = user?.subscriptionStatus ?? null;
  }

  return (
    <PricingContent
      isSignedIn={!!session}
      currentPriceId={currentPriceId}
      subscriptionStatus={subscriptionStatus}
    />
  );
}
