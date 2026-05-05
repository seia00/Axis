import "server-only";
import { prisma } from "@/lib/prisma";

export const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"]);

export function hasActiveSubscription(status?: string | null) {
  return ACTIVE_SUBSCRIPTION_STATUSES.has(status ?? "");
}

export async function userHasActiveSubscription(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionStatus: true },
  });

  return hasActiveSubscription(user?.subscriptionStatus);
}
