"use client";
import { useState } from "react";
import Link from "next/link";

const tiers = [
  {
    id: "small",
    price: "$1",
    credits: 10,
    blurb: "A taste of reality.",
  },
  {
    id: "medium",
    price: "$5",
    credits: 60,
    blurb: "For the genuinely curious.",
    popular: true,
  },
  {
    id: "large",
    price: "$10",
    credits: 150,
    blurb: "For the truly self-aware.",
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  async function buy(pack: string) {
    setLoading(pack);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else if (res.status === 401) window.location.href = "/login";
      else alert(data.error || "Something broke.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <main className="min-h-screen px-6 py-20">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <Link
            href="/"
            className="font-serif text-sm gold-text tracking-widest"
          >
            MR. CAMDEN
          </Link>
          <h1 className="font-serif text-5xl md:text-6xl gold-text mt-4">
            Truth, by the dozen.
          </h1>
          <p className="text-white/60 mt-4">One credit per message.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.id}
              className={`relative rounded-sm border p-8 ${
                t.popular
                  ? "border-gold bg-gold/5"
                  : "border-white/10 bg-white/[0.02]"
              }`}
            >
              {t.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-gradient text-bg text-xs font-bold px-3 py-1 rounded-sm uppercase tracking-wider">
                  Most Popular
                </div>
              )}
              <p className="font-serif text-5xl gold-text">{t.price}</p>
              <p className="text-2xl mt-2">{t.credits} credits</p>
              <p className="text-white/60 mt-2 italic">{t.blurb}</p>
              <button
                onClick={() => buy(t.id)}
                disabled={loading !== null}
                className="w-full mt-6 bg-gold-gradient text-bg font-semibold py-3 rounded-sm disabled:opacity-50"
              >
                {loading === t.id ? "Redirecting..." : "Buy"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
