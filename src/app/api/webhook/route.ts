import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function syncSubscription(supabase: any, stripe: Stripe, sub: Stripe.Subscription) {
  let userId = sub.metadata?.user_id;
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer.id;

  if (!userId) {
    // Fall back to lookup by stripe_customer_id
    const { data: prof } = await supabase
      .from("profiles")
      .select("id")
      .eq("stripe_customer_id", customerId)
      .maybeSingle();
    if (prof?.id) userId = prof.id;
  }
  if (!userId) return;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const periodEndRaw = (sub as any).current_period_end as number | undefined;
  const periodEnd = periodEndRaw
    ? new Date(periodEndRaw * 1000).toISOString()
    : null;

  await supabase
    .from("profiles")
    .update({
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      subscription_status: sub.status,
      subscription_current_period_end: periodEnd,
      cancel_at_period_end: sub.cancel_at_period_end ?? false,
    })
    .eq("id", userId);
}

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
      const userId =
        session.client_reference_id || session.metadata?.user_id;
      const customerId =
        typeof session.customer === "string"
          ? session.customer
          : session.customer?.id;

      // Always capture stripe_customer_id onto the profile
      if (userId && customerId) {
        await supabase
          .from("profiles")
          .update({ stripe_customer_id: customerId })
          .eq("id", userId);
      }

      // One-time payment: grant credits
      if (session.mode === "payment") {
        const credits = Number(session.metadata?.credits || 0);
        if (userId && credits > 0) {
          await supabase.rpc("add_credits", {
            p_user: userId,
            p_amount: credits,
          });
        }
      }
    } else if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated"
    ) {
      const sub = event.data.object as Stripe.Subscription;
      await syncSubscription(supabase, stripe, sub);
    } else if (event.type === "customer.subscription.deleted") {
      const sub = event.data.object as Stripe.Subscription;
      const customerId =
        typeof sub.customer === "string" ? sub.customer : sub.customer.id;
      let userId = sub.metadata?.user_id;
      if (!userId) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .maybeSingle();
        if (prof?.id) userId = prof.id;
      }
      if (userId) {
        await supabase
          .from("profiles")
          .update({
            subscription_status: "canceled",
            stripe_subscription_id: null,
            cancel_at_period_end: false,
          })
          .eq("id", userId);
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
        // Also sync sub state
        await syncSubscription(supabase, stripe, sub);
      }
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "handler_error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
