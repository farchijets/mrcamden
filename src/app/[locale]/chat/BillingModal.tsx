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

  async function buy(pack: "entry") {
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

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-bg border border-gold/40 rounded-sm shadow-2xl p-4 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t("close")}
          className="absolute top-2 right-2 text-white/60 hover:text-gold text-3xl leading-none w-11 h-11 flex items-center justify-center"
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

        <div className="border-2 border-gold rounded-sm p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gold/5">
          <div>
            <p className="font-serif text-2xl gold-text">{t("entry.title")}</p>
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
            className="bg-gold-gradient text-bg font-semibold px-6 py-3 rounded-sm disabled:opacity-40 w-full sm:w-auto"
          >
            {loading === "entry" ? t("loading") : t("entry.cta")}
          </button>
        </div>
      </div>
    </div>
  );
}
