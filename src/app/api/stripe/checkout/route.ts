import { auth } from "@/auth";
import { parseCheckoutSelection } from "@/lib/employer-billing";
import { getStripe } from "@/lib/stripe";
import { buildStripeLineItems } from "@/lib/stripe-billing";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "EMPLOYER") {
    return Response.json({ error: "Nur für Arbeitgeber." }, { status: 401 });
  }

  const stripe = await getStripe();
  if (!stripe) {
    return Response.json(
      { error: "Stripe ist nicht konfiguriert (STRIPE_SECRET_KEY)." },
      { status: 501 },
    );
  }

  const body = (await req.json()) as {
    plan?: string;
    addons?: string[];
    extraJobCount?: number;
    addonHighlight?: boolean;
    addonContactAll?: boolean;
    mode?: string;
  };

  if (body.mode === "placement") {
    const priceId = process.env.STRIPE_PRICE_PLACEMENT;
    if (!priceId) {
      return Response.json({ error: "STRIPE_PRICE_PLACEMENT fehlt." }, { status: 501 });
    }
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const checkout = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${baseUrl}/dashboard/employer/abrechnung?bezahlt=1`,
      cancel_url: `${baseUrl}/dashboard/employer/abrechnung?bezahlt=0`,
      customer_email: session.user.email ?? undefined,
      metadata: { userId: session.user.id, mode: "placement" },
    });
    return Response.json({ url: checkout.url });
  }

  const selection = await parseCheckoutSelection(body);
  if (!selection) {
    return Response.json({ error: "Ungültiges Paket." }, { status: 400 });
  }

  let lineItems: { price: string; quantity: number }[];
  try {
    lineItems = await buildStripeLineItems(selection.plan, selection.addons);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Stripe-Preise fehlen.";
    return Response.json({ error: msg }, { status: 501 });
  }

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: lineItems,
    success_url: `${baseUrl}/dashboard/employer/abrechnung?bezahlt=1`,
    cancel_url: `${baseUrl}/dashboard/employer/abrechnung?bezahlt=0`,
    customer_email: session.user.email ?? undefined,
    payment_method_types: ["card", "sepa_debit"],
    metadata: {
      userId: session.user.id,
      plan: selection.plan,
      addons: JSON.stringify(selection.addons),
    },
    subscription_data: {
      metadata: {
        userId: session.user.id,
        plan: selection.plan,
        addons: JSON.stringify(selection.addons),
      },
    },
  });

  return Response.json({ url: checkout.url });
}
