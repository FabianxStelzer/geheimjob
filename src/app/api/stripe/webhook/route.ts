import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ error: "Webhook nicht konfiguriert." }, { status: 501 });
  }

  const sig = req.headers.get("stripe-signature");
  const body = await req.text();

  if (!sig) {
    return NextResponse.json({ error: "Signatur fehlt." }, { status: 400 });
  }

  try {
    stripe.webhooks.constructEvent(body, sig, secret);
    // Hier z. B. Subscription-Status in DB schreiben oder Provision verbuchen.
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Ungültige Signatur." }, { status: 400 });
  }
}

export const runtime = "nodejs";
