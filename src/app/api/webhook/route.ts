import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apiVersion: "2024-06-20" as any,
  });

  const body = await req.text();

  let event: Stripe.Event;
  try {
    if (!sig || !secret) throw new Error("missing_signature");
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "bad_signature";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const supabase = createServiceClient();

  // Idempotency: skip if we've already processed this event id
  const { data: inserted, error: insertErr } = await supabase
    .from("stripe_events")
    .insert({ id: event.id })
    .select("id")
    .maybeSingle();
  if (insertErr) {
    // If duplicate key, treat as already processed
    if (
      typeof insertErr.code === "string" &&
      insertErr.code === "23505"
    ) {
      return NextResponse.json({ received: true, duplicate: true });
    }
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }
  if (!inserted) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      // Only grant credits here for one-time payments.
      // Subscriptions are handled in invoice.payment_succeeded so there's
      // one code path for first invoice and renewals.
      if (session.mode === "payment") {
        const userId = session.metadata?.user_id;
        const credits = Number(session.metadata?.credits || 0);
        if (userId && credits > 0) {
          await supabase.rpc("add_credits", {
            p_user: userId,
            p_amount: credits,
          });
        }
      }
    } else if (event.type === "invoice.payment_succeeded") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const invoice = event.data.object as any;
      const rawSub = invoice.subscription;
      const subId: string | undefined =
        typeof rawSub === "string" ? rawSub : rawSub?.id;
      if (subId) {
        const sub = await stripe.subscriptions.retrieve(subId);
        const userId = sub.metadata?.user_id;
        const credits = Number(sub.metadata?.credits || 0);
        if (userId && credits > 0) {
          await supabase.rpc("add_credits", {
            p_user: userId,
            p_amount: credits,
          });
        }
      }
    } else if (event.type === "customer.subscription.deleted") {
      // No-op: user keeps any credits already granted.
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "handler_error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
