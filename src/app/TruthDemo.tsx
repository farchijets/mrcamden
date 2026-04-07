"use client";
import { useState } from "react";

const QUESTION = "Should I quit my job to start my business?";

const ANSWERS: Record<number, { label: string; text: string }> = {
  1: {
    label: "Gentle",
    text: "It takes guts to even ask. Before you leap, give yourself a real runway — six to twelve months of savings, a rough plan, and at least one person who's said yes with their wallet. That isn't fear talking, that's respect for the dream.",
  },
  3: {
    label: "Honest",
    text: "Wanting it badly isn't a plan. Most people who quit early run out of money before the idea finds its legs. Build savings, write the plan, and land one paying customer before you walk out that door.",
  },
  5: {
    label: "Real",
    text: "Look — the romantic version of this story is a lie. You need savings, a plan, and at least one person willing to pay you before you have a business. Until then, you have a hobby with a notice period.",
  },
  7: {
    label: "Blunt",
    text: "You're not asking me a question, you're asking for permission. I'm not giving it. Get a paying customer first. Until then, your job is funding your fantasy.",
  },
  10: {
    label: "Brutal",
    text: "Here's the deal: most people who 'quit to chase the dream' come crawling back in 18 months — poorer, quieter, and pretending it was a learning experience. You don't have a business. You have a feeling. Feelings don't pay rent. Build it nights and weekends. If it survives that, then we'll talk about quitting.",
  },
};

const STOPS = [1, 3, 5, 7, 10];

function nearest(v: number): number {
  return STOPS.reduce((a, b) => (Math.abs(b - v) < Math.abs(a - v) ? b : a));
}

export default function TruthDemo() {
  const [val, setVal] = useState(5);
  const stop = nearest(val);
  const answer = ANSWERS[stop];

  return (
    <div className="mt-20 rounded-sm border border-gold/30 bg-white/[0.02] p-6 md:p-10 backdrop-blur-sm">
      <p className="mb-2 text-center text-xs uppercase tracking-[0.3em] text-gold/80">
        Try the Truth Dial
      </p>
      <p className="mb-8 text-center font-serif text-2xl md:text-3xl text-white">
        &ldquo;{QUESTION}&rdquo;
      </p>

      <div className="mx-auto max-w-xl">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="uppercase tracking-widest text-gold/80">
            Truth Dial
          </span>
          <span className="font-semibold text-gold">
            {val}/10 — {answer.label}
          </span>
        </div>
        <input
          type="range"
          min={1}
          max={10}
          step={1}
          value={val}
          onChange={(e) => setVal(Number(e.target.value))}
          className="truth-slider w-full"
        />
        <div className="mt-1 flex justify-between text-[10px] uppercase tracking-widest text-white/40">
          <span>Gentle</span>
          <span>Real</span>
          <span>Brutal</span>
        </div>
      </div>

      <div className="mt-8 border-t border-gold/20 pt-6">
        <p className="mb-2 text-xs uppercase tracking-widest text-gold">
          Mr. Camden
        </p>
        <p
          key={stop}
          className="animate-fade-in-up font-serif text-lg md:text-xl leading-relaxed text-white/90"
        >
          {answer.text}
        </p>
      </div>

      <p className="mt-6 text-center text-xs text-white/40">
        Drag the dial. Same question, different levels of mercy.
      </p>
    </div>
  );
}
