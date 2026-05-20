import Stripe from "stripe";

/** Stripe optional: ohne Keys werden Checkout-Routen einen Hinweis zurückgeben. */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}
