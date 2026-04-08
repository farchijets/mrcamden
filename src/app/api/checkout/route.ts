import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const PACKS = {
  entry: {
    priceEnv: "STRIPE_PRICE_ENTRY",
    credits: 10,
    mode: "payment" as const,
  },
  pro: {
    priceEnv: "STRIPE_PRICE_PRO",
    credits: 100,
    mode: "subscription" as const,
  },
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

    const cfg = PACKS[pack];
    const priceId = process.env[cfg.priceEnv];
    if (!priceId) {
      return NextResponse.json({ error: "price_not_set" }, { status: 500 });
    }

    const site =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: any = {
      mode: cfg.mode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${site}/chat?purchase=success`,
      cancel_url: `${site}/pricing?purchase=cancel`,
      metadata: {
        user_id: user.id,
        credits: String(cfg.credits),
      },
    };

    if (cfg.mode === "subscription") {
      params.subscription_data = {
        metadata: {
          user_id: user.id,
          credits: String(cfg.credits),
        },
      };
    }

    const session = await stripe.checkout.sessions.create(params);

    return NextResponse.json({ url: session.url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "server_error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
