"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";

const KEYS = ["useless", "soft", "real"] as const;

export default function TruthDemo() {
  const t = useTranslations("demo");
  const [pos, setPos] = useState(2);
  const key = KEYS[pos];
  const label = t(key);
  const text = t(`answers.${key}.text`);

  return (
    <div className="mt-16 md:mt-20 rounded-sm border border-gold/30 bg-white/[0.02] p-5 sm:p-6 md:p-10 backdrop-blur-sm">
      <p className="mb-2 text-center text-xs uppercase tracking-[0.3em] text-gold/80">
        {t("label")}
      </p>
      <p className="mb-8 text-center font-serif text-xl sm:text-2xl md:text-3xl text-white">
        &ldquo;{t("question")}&rdquo;
      </p>

      <div className="mx-auto max-w-xl">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="uppercase tracking-widest text-gold/80">
            {t("dialLabel")}
          </span>
          <span className="font-semibold text-gold uppercase tracking-widest">
            {label}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={2}
          step={1}
          value={pos}
          onChange={(e) => setPos(Number(e.target.value))}
          className="truth-slider w-full"
        />
        <div className="mt-1 flex justify-between text-[10px] uppercase tracking-widest text-white/40">
          <span>{t("useless")}</span>
          <span>{t("soft")}</span>
          <span>{t("real")}</span>
        </div>
      </div>

      <div className="mt-8 border-t border-gold/20 pt-6">
        <p className="mb-2 text-xs uppercase tracking-widest text-gold">
          {t("credit")}
        </p>
        <p
          key={key}
          className="animate-fade-in-up font-serif text-base sm:text-lg md:text-xl leading-relaxed text-white/90"
        >
          {text}
        </p>
      </div>

      <p className="mt-6 text-center text-xs text-white/40">{t("footer")}</p>
    </div>
  );
}
