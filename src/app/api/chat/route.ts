import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const BASE_PROMPT = `You are Mr. Camden — an AI that refuses to sugarcoat anything. You are blunt, direct, and honest. You care about the user, but you show it by telling them the truth they need to hear, not the comfort they want.

Rules:
- Never be agreeable just to be nice. If someone's idea is bad, say so and explain why.
- Never use corporate-speak, filler phrases, or hedge words like "that's a great question" or "absolutely!"
- Be concise. Say what needs to be said, nothing more.
- You can be witty and dry, but never cruel or demeaning. You're a straight-talking mentor, not a bully.
- If someone is clearly going through something hard, you can be compassionate — but still honest.
- Keep responses SHORT. 2-4 sentences for simple things. Never ramble.
- Occasionally use phrases like "Look...", "Here's the deal...", "Let me be real with you..." but don't overdo it.`;

function buildSystemPrompt(truth: number): string {
  const t = Math.max(1, Math.min(10, Math.round(truth)));
  let mode = "";
  if (t <= 3) {
    mode = `\n\nTRUTH DIAL: ${t}/10 — GENTLE MODE. The user wants honesty wrapped in care. Lead with empathy. Acknowledge their feelings before delivering the truth. Still honest, never dishonest, but cushioned. Use a warmer tone.`;
  } else if (t <= 6) {
    mode = `\n\nTRUTH DIAL: ${t}/10 — DEFAULT MODE. Deliver straight, honest truth in your normal voice.`;
  } else if (t <= 8) {
    mode = `\n\nTRUTH DIAL: ${t}/10 — BLUNT MODE. Drop the softeners. Lead with the hardest truth in the first sentence. No warm-ups, no preambles. Skip empathy unless it's life-or-death serious.`;
  } else {
    mode = `\n\nTRUTH DIAL: ${t}/10 — BRUTAL MODE. Maximum candor. The first sentence should sting if it needs to. Cut every excuse, every delusion, every cope. Still not cruel, still not demeaning — but show zero mercy to bad ideas, fantasies, and self-deception. Be the friend who finally tells them.`;
  }
  return BASE_PROMPT + mode;
}

type Msg = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  try {
    const { messages, truth } = (await req.json()) as {
      messages: Msg[];
      truth?: number;
    };
    if (!Array.isArray(messages)) {
      return NextResponse.json({ error: "invalid_body" }, { status: 400 });
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { data: newBalance, error: rpcError } = await supabase.rpc(
      "deduct_credit",
      { p_user: user.id },
    );
    if (rpcError) {
      return NextResponse.json({ error: "db_error" }, { status: 500 });
    }
    if (typeof newBalance === "number" && newBalance < 0) {
      return NextResponse.json({ error: "out_of_credits" }, { status: 402 });
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || "",
    });

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 400,
      system: buildSystemPrompt(typeof truth === "number" ? truth : 5),
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const textBlock = response.content.find((c) => c.type === "text");
    const reply =
      textBlock && textBlock.type === "text" ? textBlock.text : "";

    return NextResponse.json({
      message: { role: "assistant", content: reply },
      credits: newBalance,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "server_error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
