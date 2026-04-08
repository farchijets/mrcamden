"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type Props = {
  open: boolean;
  onClose: () => void;
  credits: number;
  hasActiveSub: boolean;
  locale: string;
};

export default function BillingModal({
  open,
  onClose,
  credits,
  hasActiveSub,
  locale,
}: Props) {
  const t = useTranslations("billing");
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function buy(pack: "entry" | "pro") {
    setLoading(pack);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack, locale }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setLoading(null);
    } catch {
      setLoading(null);
    }
  }

  async function manage() {
    setLoading("manage");
    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setLoading(null);
    } catch {
      setLoading(null);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-bg border border-gold/40 rounded-sm shadow-2xl p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t("close")}
          className="absolute top-3 right-3 text-white/60 hover:text-gold text-2xl leading-none w-8 h-8 flex items-center justify-center"
        >
          ×
        </button>

        <div className="mb-6">
          <h2 className="font-serif text-3xl gold-text">{t("title")}</h2>
          <p className="text-white/60 mt-1">{t("subtitle")}</p>
          <p className="text-xs text-white/40 mt-2 uppercase tracking-widest">
            {t("currentCredits")}:{" "}
            <span className="text-gold font-semibold">{credits}</span>
          </p>
        </div>

        <div className="space-y-4">
          {/* Entry pack */}
          <div className="border border-white/15 rounded-sm p-5 flex items-center justify-between gap-4">
            <div>
              <p className="font-serif text-xl text-white">
                {t("entry.title")}
              </p>
              <p className="text-gold font-semibold mt-1">
                {t("entry.price")}{" "}
                <span className="text-white/50 text-sm font-normal">
                  {t("entry.unit")}
                </span>
              </p>
            </div>
            <button
              type="button"
              disabled={loading !== null}
              onClick={() => buy("entry")}
              className="bg-white/10 hover:bg-white/20 border border-gold/40 text-white font-semibold px-5 py-2.5 rounded-sm disabled:opacity-40"
            >
              {loading === "entry" ? t("loading") : t("entry.cta")}
            </button>
          </div>

          {/* Pro sub */}
          <div className="relative border-2 border-gold rounded-sm p-5 flex items-center justify-between gap-4 bg-gold/5">
            <span className="absolute -top-3 left-5 bg-gold-gradient text-bg text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm">
              {t("pro.badge")}
            </span>
            <div>
              <p className="font-serif text-xl gold-text">{t("pro.title")}</p>
              <p className="text-gold font-semibold mt-1">
                {t("pro.price")}{" "}
                <span className="text-white/50 text-sm font-normal">
                  {t("pro.unit")}
                </span>
              </p>
              <p className="text-xs text-white/60 mt-1">{t("pro.credits")}</p>
            </div>
            {hasActiveSub ? (
              <span className="text-xs uppercase tracking-widest text-gold border border-gold/60 px-3 py-2 rounded-sm">
                {t("pro.current")}
              </span>
            ) : (
              <button
                type="button"
                disabled={loading !== null}
                onClick={() => buy("pro")}
                className="bg-gold-gradient text-bg font-semibold px-5 py-2.5 rounded-sm disabled:opacity-40"
              >
                {loading === "pro" ? t("loading") : t("pro.cta")}
              </button>
            )}
          </div>
        </div>

        {hasActiveSub && (
          <div className="mt-6 pt-5 border-t border-white/10 text-center">
            <button
              type="button"
              disabled={loading !== null}
              onClick={manage}
              className="text-sm text-gold hover:underline disabled:opacity-40"
            >
              {loading === "manage" ? t("loading") : t("manage")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
