import Stripe from "stripe";
import { getStripeSecretKey } from "@/lib/platform-settings";

/** Stripe: Secret aus Super-Admin-DB oder .env */
export async function getStripe(): Promise<Stripe | null> {
  const key = await getStripeSecretKey();
  if (!key) return null;
  return new Stripe(key);
}
