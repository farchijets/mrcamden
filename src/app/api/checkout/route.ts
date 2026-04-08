import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const PACKS = {
  entry: {
    priceEnv: "STRIPE_PRICE_ENTRY",
    credits: 50,
    mode: "payment" as const,
  },
} as const;

type Pack = keyof typeof PACKS;

export async function POST(req: Request) {
  try {
    const { pack, locale: bodyLocale } = (await req.json()) as {
      pack: Pack;
      locale?: string;
    };
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

    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      apiVersion: "2024-06-20" as any,
    });

    const cfg = PACKS[pack];
    const priceId = process.env[cfg.priceEnv];
    if (!priceId) {
      return NextResponse.json({ error: "price_not_set" }, { status: 500 });
    }

    const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const locale = bodyLocale || "en";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: any = {
      mode: cfg.mode,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${site}/${locale}/chat?billing=success`,
      cancel_url: `${site}/${locale}/chat?billing=cancel`,
      client_reference_id: user.id,
      allow_promotion_codes: true,
      metadata: {
        user_id: user.id,
        credits: String(cfg.credits),
      },
    };

    if (profile?.stripe_customer_id) {
      params.customer = profile.stripe_customer_id;
    } else if (user.email) {
      params.customer_email = user.email;
    }

    const session = await stripe.checkout.sessions.create(params);

    return NextResponse.json({ url: session.url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "server_error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
