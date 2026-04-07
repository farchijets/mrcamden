import Link from "next/link";

const samples = [
  {
    q: "I want to build Uber for cats.",
    a: "Look — cats don't need rides. Their owners do, and they already have Uber. You're solving a problem nobody has. Kill it and find a real one.",
  },
  {
    q: "My ex texted me 'hey'. Should I respond?",
    a: "Here's the deal: one word after a breakup isn't an apology, a plan, or a future. It's boredom. If you respond, do it knowing you're the entertainment.",
  },
  {
    q: "Everyone says my idea is amazing.",
    a: "Everyone says that because it costs them nothing. Ask them to pre-order it. Watch the 'amazing' evaporate. Real validation has a dollar sign.",
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
        <div className="animate-fade-in-up text-center">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-gold/80">
            Est. Truthfully
          </p>
          <h1 className="font-serif text-6xl md:text-8xl font-bold tracking-tight gold-text">
            MR. CAMDEN
          </h1>
          <p className="mt-6 text-xl md:text-2xl text-white/80 italic font-serif">
            The AI that won&rsquo;t kiss your behind.
          </p>
          <div className="mt-10">
            <Link
              href="/signup"
              className="inline-block rounded-sm border border-gold bg-gold-gradient px-8 py-4 font-semibold text-bg shadow-lg shadow-gold/20 transition hover:brightness-110"
            >
              Try 3 Free Messages
            </Link>
          </div>
        </div>

        <div className="mt-24 grid gap-6 md:grid-cols-3">
          {samples.map((s, i) => (
            <div
              key={i}
              className="animate-fade-in-up rounded-sm border border-gold/20 bg-white/[0.02] p-6 backdrop-blur-sm"
              style={{ animationDelay: `${0.2 + i * 0.15}s` }}
            >
              <p className="mb-3 text-sm text-white/50">You asked:</p>
              <p className="mb-5 font-serif text-lg text-white">
                &ldquo;{s.q}&rdquo;
              </p>
              <div className="border-t border-gold/20 pt-4">
                <p className="mb-2 text-xs uppercase tracking-widest text-gold">
                  Mr. Camden
                </p>
                <p className="text-white/80 leading-relaxed">{s.a}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-20 text-center text-xs text-white/40">
          No hedging. No hype. No &ldquo;great question!&rdquo;
        </p>
      </div>
    </main>
  );
}
