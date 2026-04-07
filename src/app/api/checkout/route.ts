import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const PACKS = {
  small: { priceEnv: "STRIPE_PRICE_SMALL", credits: 10 },
  medium: { priceEnv: "STRIPE_PRICE_MEDIUM", credits: 60 },
  large: { priceEnv: "STRIPE_PRICE_LARGE", credits: 150 },
} as const;

type Pack = keyof typeof PACKS;

export async function POST(req: Request) {
  try {
    const { pack } = (await req.json()) as { pack: Pack };
    if (!pack || !(pack in PACKS)) {
      return NextResponse.json({ error: "invalid_pack" }, { status: 400 });
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      apiVersion: "2024-06-20" as any,
    });

    const priceId = process.env[PACKS[pack].priceEnv];
    if (!priceId) {
      return NextResponse.json({ error: "price_not_set" }, { status: 500 });
    }

    const site =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${site}/chat?purchase=success`,
      cancel_url: `${site}/pricing?purchase=cancel`,
      metadata: {
        user_id: user.id,
        credits: String(PACKS[pack].credits),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "server_error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
