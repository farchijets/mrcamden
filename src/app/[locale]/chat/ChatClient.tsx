"use client";
import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import LanguageSwitcher from "../LanguageSwitcher";
import Logo from "../Logo";
import BillingModal from "./BillingModal";
import { createClient } from "@/lib/supabase/client";

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
  const tNav = useTranslations("nav");
  const tHome = useTranslations("home.chatHome");

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = `/${locale}`;
  }

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [credits, setCredits] = useState(initialCredits);
  const [loading, setLoading] = useState(false);
  const [outOfCredits, setOutOfCredits] = useState(initialCredits <= 0);
  const [showUpsell, setShowUpsell] = useState(false);
  // Truth dial is locked to "Real" in chat — Useless/Soft are visual only.
  const truth = 10;
  const truthLabel = t("real");
  const [billingOpen, setBillingOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

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

  async function doSend(text: string, opts?: { fromPending?: boolean }) {
    if (!text.trim() || loading || outOfCredits) return;
    if (text.length > 1000) return;

    const userMsg: Msg = { role: "user", content: text.trim() };
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
        if (opts?.fromPending) setShowUpsell(true);
      }
    } finally {
      setLoading(false);
    }
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    await doSend(input);
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    let pending: string | null = null;
    try {
      pending = localStorage.getItem("mrcamden_pending_q");
    } catch {}
    if (pending && pending.trim()) {
      try {
        localStorage.removeItem("mrcamden_pending_q");
      } catch {}
      doSend(pending, { fromPending: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="flex flex-col h-[100dvh]">
      <header className="border-b border-gold/20 px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
        <Link href="/" className="shrink-0">
          <Logo size="md" />
        </Link>
        <div className="hidden sm:flex items-center gap-4">
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
          <button
            type="button"
            onClick={signOut}
            className="text-sm text-white/50 hover:text-gold transition px-2"
          >
            {tNav("logout")}
          </button>
        </div>

        <div className="sm:hidden relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Open menu"
            className="flex items-center justify-center w-11 h-11 rounded-full border border-gold/40 hover:border-gold/80 hover:bg-gold/5 transition"
          >
            {/* Monocle icon — Mr. Camden's signature */}
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#e6c26e"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="11" r="6" />
              <circle cx="9" cy="11" r="2" fill="#e6c26e" stroke="none" />
              <path d="M15 14 Q19 18 17 22" />
            </svg>
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-64 z-40 rounded-sm border border-gold/40 bg-bg/95 backdrop-blur-md shadow-2xl shadow-black/60 p-3 space-y-3 animate-fade-in-up">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setBillingOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-3 py-3 rounded-sm border border-gold/30 hover:border-gold/70 hover:bg-gold/5 transition"
                >
                  <span className="text-white/60 text-sm">{t("credits")}</span>
                  <span className="text-gold font-semibold">
                    {credits}
                    <span className="ml-2 text-xs text-gold/70">+</span>
                  </span>
                </button>
                <div className="flex items-center justify-between px-3 py-2 rounded-sm border border-white/10">
                  <span className="text-white/50 text-xs uppercase tracking-widest">
                    Language
                  </span>
                  <LanguageSwitcher currentLocale={locale} />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    signOut();
                  }}
                  className="w-full flex items-center justify-center px-3 py-3 rounded-sm border border-white/10 text-white/60 hover:text-gold hover:border-gold/40 transition text-sm"
                >
                  {tNav("logout")}
                </button>
              </div>
            </>
          )}
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
          {showUpsell && !loading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] bg-gold/5 border border-gold/40 px-5 py-4 rounded-sm">
                <p className="text-xs uppercase tracking-widest text-gold mb-2">
                  {t("credit")}
                </p>
                <p className="whitespace-pre-wrap text-white/90 mb-4">
                  {tHome("upsellText")}
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => setBillingOpen(true)}
                    className="flex-1 bg-gold-gradient text-bg font-semibold px-4 py-3 rounded-sm"
                  >
                    {tHome("upsellBuy")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingOpen(true)}
                    className="flex-1 border border-gold/60 text-gold hover:bg-gold/10 font-semibold px-4 py-3 rounded-sm"
                  >
                    {tHome("upsellPro")}
                  </button>
                </div>
              </div>
            </div>
          )}
          {outOfCredits && !showUpsell && (
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
        <div className="max-w-3xl mx-auto mb-3 flex items-center justify-center gap-2 text-xs">
          <span className="uppercase tracking-widest text-white/50">
            {t("truthDial")}:
          </span>
          <span className="uppercase tracking-widest text-gold font-semibold">
            {truthLabel}
          </span>
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
