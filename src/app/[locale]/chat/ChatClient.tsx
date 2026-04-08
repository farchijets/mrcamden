"use client";
import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import LanguageSwitcher from "../LanguageSwitcher";
import BillingModal from "./BillingModal";

type Msg = { role: "user" | "assistant"; content: string };

export default function ChatClient({
  initialCredits,
  locale,
  hasActiveSub,
}: {
  initialCredits: number;
  locale: string;
  hasActiveSub: boolean;
}) {
  const t = useTranslations("chat");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [credits, setCredits] = useState(initialCredits);
  const [loading, setLoading] = useState(false);
  const [outOfCredits, setOutOfCredits] = useState(initialCredits <= 0);
  // Slider position 0=Useless, 1=Soft, 2=Real (mapped to API truth 1/5/10)
  const [truthPos, setTruthPos] = useState(2);
  const TRUTH_API = [1, 5, 10] as const;
  const truth = TRUTH_API[truthPos];
  const TRUTH_KEYS = ["useless", "soft", "real"] as const;
  const truthLabel = t(TRUTH_KEYS[truthPos]);
  const [billingOpen, setBillingOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("billing") === "success") {
      url.searchParams.delete("billing");
      const clean = url.pathname + (url.search ? url.search : "");
      window.history.replaceState({}, "", clean);
      window.location.reload();
    } else if (url.searchParams.get("billing") === "cancel") {
      url.searchParams.delete("billing");
      const clean = url.pathname + (url.search ? url.search : "");
      window.history.replaceState({}, "", clean);
    }
  }, []);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading || outOfCredits) return;
    if (input.length > 1000) return;

    const userMsg: Msg = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, truth, locale }),
      });

      if (res.status === 402) {
        setOutOfCredits(true);
        setCredits(0);
        return;
      }

      const data = await res.json();
      if (data.message) {
        setMessages([...newMessages, data.message]);
        if (typeof data.credits === "number") {
          setCredits(data.credits);
          if (data.credits <= 0) setOutOfCredits(true);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-col h-[100dvh]">
      <header className="border-b border-gold/20 px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
        <Link href="/" className="font-serif text-lg sm:text-2xl gold-text tracking-wide whitespace-nowrap">
          MR. CAMDEN
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <LanguageSwitcher currentLocale={locale} />
          <button
            type="button"
            onClick={() => setBillingOpen(true)}
            className="text-sm border border-gold/30 hover:border-gold/70 hover:bg-gold/5 rounded-sm px-3 py-2 min-h-[44px] transition"
          >
            <span className="text-white/50">{t("credits")}: </span>
            <span className="text-gold font-semibold">{credits}</span>
            <span className="ml-2 text-xs text-gold/70">+</span>
          </button>
        </div>
      </header>

      <BillingModal
        open={billingOpen}
        onClose={() => setBillingOpen(false)}
        credits={credits}
        hasActiveSub={hasActiveSub}
        locale={locale}
      />

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-white/40 mt-12">
              <p className="font-serif text-xl">{t("empty")}</p>
            </div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-5 py-3 rounded-sm ${
                  m.role === "user"
                    ? "bg-[#c8a04a]/15 border border-gold/30"
                    : "bg-white/[0.03] border border-white/10"
                }`}
              >
                {m.role === "assistant" && (
                  <p className="text-xs uppercase tracking-widest text-gold mb-1">
                    {t("credit")}
                  </p>
                )}
                <p className="whitespace-pre-wrap text-white/90">{m.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/[0.03] border border-white/10 px-5 py-4 rounded-sm">
                <div className="flex gap-2">
                  <span className="w-2 h-2 rounded-full bg-gold animate-pulse-dot" />
                  <span
                    className="w-2 h-2 rounded-full bg-gold animate-pulse-dot"
                    style={{ animationDelay: "0.2s" }}
                  />
                  <span
                    className="w-2 h-2 rounded-full bg-gold animate-pulse-dot"
                    style={{ animationDelay: "0.4s" }}
                  />
                </div>
              </div>
            </div>
          )}
          {outOfCredits && (
            <div className="mt-8 rounded-sm border border-gold/40 bg-gold/5 p-6 text-center">
              <p className="font-serif text-2xl gold-text mb-2">
                {t("outOfCreditsTitle")}
              </p>
              <p className="text-white/70 mb-4">{t("outOfCreditsBody")}</p>
              <Link
                href="/pricing"
                className="inline-block bg-gold-gradient text-bg font-semibold px-6 py-3 rounded-sm"
              >
                {t("seePricing")}
              </Link>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={send} className="border-t border-gold/20 px-3 sm:px-4 py-4 bg-bg">
        <div className="max-w-3xl mx-auto mb-3">
          <div className="flex items-center justify-between mb-1 text-xs">
            <span className="uppercase tracking-widest text-gold/80">
              {t("truthDial")}
            </span>
            <span className="text-gold font-semibold uppercase tracking-widest">
              {truthLabel}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={2}
            step={1}
            value={truthPos}
            onChange={(e) => setTruthPos(Number(e.target.value))}
            className="truth-slider w-full"
          />
          <div className="flex justify-between text-[10px] text-white/40 uppercase tracking-widest mt-1">
            <span>{t("useless")}</span>
            <span>{t("soft")}</span>
            <span>{t("real")}</span>
          </div>
        </div>
        <div className="max-w-3xl mx-auto flex gap-2 sm:gap-3">
          <input
            type="text"
            value={input}
            maxLength={1000}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              outOfCredits ? t("outOfCreditsPlaceholder") : t("placeholder")
            }
            disabled={outOfCredits || loading}
            className="flex-1 min-w-0 bg-black/50 border border-white/10 rounded-sm px-3 sm:px-4 py-3 text-white focus:border-gold outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={
              outOfCredits || loading || !input.trim() || input.length > 1000
            }
            className="bg-gold-gradient text-bg font-semibold px-4 sm:px-6 py-3 rounded-sm disabled:opacity-30 shrink-0"
          >
            {t("send")}
          </button>
        </div>
        <div className="max-w-3xl mx-auto mt-2 text-right text-xs tabular-nums">
          <span
            className={
              input.length >= 950
                ? "text-red-400"
                : input.length >= 900
                  ? "text-gold"
                  : "text-white/40"
            }
          >
            {input.length} / 1000
          </span>
        </div>
      </form>
    </main>
  );
}
