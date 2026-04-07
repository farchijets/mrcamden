"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";

const STOPS = [1, 3, 5, 7, 10];

function nearest(v: number): number {
  return STOPS.reduce((a, b) => (Math.abs(b - v) < Math.abs(a - v) ? b : a));
}

export default function TruthDemo() {
  const t = useTranslations("demo");
  const [val, setVal] = useState(5);
  const stop = nearest(val);
  const label = t(`answers.${stop}.label`);
  const text = t(`answers.${stop}.text`);

  return (
    <div className="mt-20 rounded-sm border border-gold/30 bg-white/[0.02] p-6 md:p-10 backdrop-blur-sm">
      <p className="mb-2 text-center text-xs uppercase tracking-[0.3em] text-gold/80">
        {t("label")}
      </p>
      <p className="mb-8 text-center font-serif text-2xl md:text-3xl text-white">
        &ldquo;{t("question")}&rdquo;
      </p>

      <div className="mx-auto max-w-xl">
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="uppercase tracking-widest text-gold/80">
            {t("dialLabel")}
          </span>
          <span className="font-semibold text-gold">
            {val}/10 — {label}
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
          <span>{t("gentle")}</span>
          <span>{t("real")}</span>
          <span>{t("brutal")}</span>
        </div>
      </div>

      <div className="mt-8 border-t border-gold/20 pt-6">
        <p className="mb-2 text-xs uppercase tracking-widest text-gold">
          {t("credit")}
        </p>
        <p
          key={stop}
          className="animate-fade-in-up font-serif text-lg md:text-xl leading-relaxed text-white/90"
        >
          {text}
        </p>
      </div>

      <p className="mt-6 text-center text-xs text-white/40">{t("footer")}</p>
    </div>
  );
}
