import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      return_url?: string;
      locale?: string;
    };

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

    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ error: "no_customer" }, { status: 400 });
    }

    const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const locale = body.locale || "en";
    const return_url = body.return_url || `${site}/${locale}/chat`;

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      apiVersion: "2024-06-20" as any,
    });

    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url,
    });

    return NextResponse.json({ url: session.url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "server_error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
