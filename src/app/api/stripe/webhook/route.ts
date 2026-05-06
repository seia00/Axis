import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { safeError } from "@/lib/security";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

type SubscriptionSnapshot = {
  customerId: string | null;
  subscriptionId: string;
  status: string;
  priceId: string | null;
  currentPeriodEnd: Date | null;
  userId: string | null;
};

function idFrom(value: string | { id: string } | null | undefined) {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

function snapshotSubscription(subscription: Stripe.Subscription): SubscriptionSnapshot {
  const item = subscription.items.data[0];
  return {
    customerId: idFrom(subscription.customer),
    subscriptionId: subscription.id,
    status: subscription.status,
    priceId: item?.price.id ?? null,
    currentPeriodEnd: item?.current_period_end
      ? new Date(item.current_period_end * 1000)
      : null,
    userId: subscription.metadata.userId ?? null,
  };
}

async function updateUserSubscription(snapshot: SubscriptionSnapshot) {
  const where =
    snapshot.userId
      ? { id: snapshot.userId }
      : snapshot.customerId
        ? { stripeCustomerId: snapshot.customerId }
        : snapshot.subscriptionId
          ? { stripeSubscriptionId: snapshot.subscriptionId }
          : null;

  if (!where) return;

  await prisma.user.updateMany({
    where,
    data: {
      stripeCustomerId: snapshot.customerId ?? undefined,
      stripeSubscriptionId: snapshot.subscriptionId,
      subscriptionStatus: snapshot.status,
      priceId: snapshot.priceId,
      currentPeriodEnd: snapshot.currentPeriodEnd,
    },
  });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId ?? session.client_reference_id;
  const customerId = idFrom(session.customer);
  const subscriptionId = idFrom(session.subscription);
  if (!userId || !customerId) return;

  if (!subscriptionId) {
    await prisma.user.update({
      where: { id: userId },
      data: { stripeCustomerId: customerId },
    });
    return;
  }

  const subscription = await getStripe().subscriptions.retrieve(subscriptionId);
  await updateUserSubscription({
    ...snapshotSubscription(subscription),
    customerId,
    userId,
  });
}

async function handleSubscription(subscription: Stripe.Subscription) {
  await updateUserSubscription(snapshotSubscription(subscription));
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = idFrom(invoice.customer);
  const legacySubscription = (invoice as Stripe.Invoice & {
    subscription?: string | Stripe.Subscription | null;
  }).subscription;
  const subscriptionId = idFrom(invoice.parent?.subscription_details?.subscription ?? legacySubscription);

  await prisma.user.updateMany({
    where: subscriptionId ? { stripeSubscriptionId: subscriptionId } : { stripeCustomerId: customerId ?? "" },
    data: { subscriptionStatus: "past_due" },
  });
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook secret is not configured" }, { status: 500 });
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json({ error: "Stripe secret key is not configured" }, { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  const stripe = getStripe();
  try {
    event = stripe.webhooks.constructEvent(await req.text(), signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid Stripe signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await handleSubscription(event.data.object as Stripe.Subscription);
        break;
      case "invoice.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    return safeError(err);
  }
}
