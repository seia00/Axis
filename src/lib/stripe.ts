import "server-only";
import Stripe from "stripe";

/**
 * Lazy Stripe client.
 *
 * Constructed on first access via a Proxy so the SDK never tries to
 * authenticate at module load time. This matters during Next.js production
 * builds, which collect page data for every API route — if Stripe were
 * instantiated eagerly with a missing STRIPE_SECRET_KEY, the build fails with
 * "Neither apiKey nor config.authenticator provided" before any actual
 * request reaches the route handler.
 *
 * With the Proxy, Stripe only initializes when a method is actually called
 * (i.e. at request time), and we throw a clear error if the key is missing.
 */

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set — billing endpoints unavailable. " +
      "Add the key to .env.local or your deploy environment."
    );
  }
  _stripe = new Stripe(key, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apiVersion: "2026-02-25.clover" as any,
    typescript: true,
  });
  return _stripe;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return getStripe()[prop as keyof Stripe];
  },
});

export function getAppUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
