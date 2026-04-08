"use client";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import Logo from "../Logo";

type TierId = "entry" | "pro";

const TIERS: {
  id: TierId;
  price: string;
  credits: number;
  recurring: boolean;
  popular?: boolean;
}[] = [
  { id: "entry", price: "$5", credits: 10, recurring: false },
  { id: "pro", price: "$35", credits: 100, recurring: true, popular: true },
];

export default function PricingPage() {
  const t = useTranslations("pricing");
  const locale = useLocale();
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
      else if (res.status === 401) window.location.href = `/${locale}/login`;
      else alert(data.error || t("errorGeneric"));
    } finally {
      setLoading(null);
    }
  }

  return (
    <main className="min-h-screen px-6 py-20">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <Link href="/" className="inline-block">
            <Logo size="sm" />
          </Link>
          <h1 className="font-serif text-5xl md:text-6xl gold-text mt-4">
            {t("title")}
          </h1>
          <p className="text-white/60 mt-4">{t("subtitle")}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {TIERS.map((tier) => (
            <div
              key={tier.id}
              className={`relative rounded-sm border p-8 ${
                tier.popular
                  ? "border-gold bg-gold/5"
                  : "border-white/10 bg-white/[0.02]"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-gradient text-bg text-xs font-bold px-3 py-1 rounded-sm uppercase tracking-wider">
                  {t("popular")}
                </div>
              )}
              <p className="font-serif text-5xl gold-text">
                {tier.price}
                <span className="text-xl text-white/60 font-sans not-italic ml-1">
                  {tier.recurring ? t("perMonth") : t("oneTime")}
                </span>
              </p>
              <p className="text-2xl mt-2">{t("credits", { n: tier.credits })}</p>
              {tier.recurring && (
                <p className="text-sm text-gold/80 mt-1">{t("renews")}</p>
              )}
              <p className="text-white/60 mt-2 italic">
                {t(`tiers.${tier.id}.blurb`)}
              </p>
              <button
                onClick={() => buy(tier.id)}
                disabled={loading !== null}
                className="w-full mt-6 bg-gold-gradient text-bg font-semibold py-3 rounded-sm disabled:opacity-50"
              >
                {loading === tier.id ? t("redirecting") : t("buy")}
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
