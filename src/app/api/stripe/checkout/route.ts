import { auth } from "@/auth";
import { getStripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return Response.json(
      { error: "Stripe ist nicht konfiguriert (STRIPE_SECRET_KEY)." },
      { status: 501 },
    );
  }

  const body = (await req.json()) as { mode?: "subscription" | "placement" };
  const mode = body.mode === "placement" ? "placement" : "subscription";
  const priceId =
    mode === "placement"
      ? process.env.STRIPE_PRICE_PLACEMENT
      : process.env.STRIPE_PRICE_SUBSCRIPTION;

  if (!priceId) {
    return Response.json(
      { error: "Es fehlt STRIPE_PRICE_SUBSCRIPTION oder STRIPE_PRICE_PLACEMENT." },
      { status: 501 },
    );
  }

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const checkout = await stripe.checkout.sessions.create({
    mode: mode === "placement" ? "payment" : "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/dashboard?bezahlt=1`,
    cancel_url: `${baseUrl}/dashboard?bezahlt=0`,
    customer_email: session.user.email ?? undefined,
    metadata: {
      userId: session.user.id,
      mode,
    },
  });

  return Response.json({ url: checkout.url });
}
