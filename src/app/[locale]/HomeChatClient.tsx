"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import LanguageSwitcher from "./LanguageSwitcher";
import SignupModal from "./SignupModal";

type Msg = { role: "user" | "assistant"; content: string };

export default function HomeChatClient({ locale }: { locale: string }) {
  const tNav = useTranslations("nav");
  const tChat = useTranslations("chat");
  const tDemo = useTranslations("demo");
  const tHome = useTranslations("home.chatHome");

  const seeded: Msg[] = [
    { role: "user", content: tDemo("question") },
    { role: "assistant", content: tHome("sampleA") },
  ];

  const [input, setInput] = useState("");
  const [signupOpen, setSignupOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  const [pricingThinking, setPricingThinking] = useState(false);

  function openPricing() {
    setMenuOpen(false);
    if (showPricing || pricingThinking) return;
    setPricingThinking(true);
    setTimeout(() => {
      setPricingThinking(false);
      setShowPricing(true);
    }, 900);
  }

  const truthLabel = tChat("real");

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  function trySend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    if (input.length > 1000) return;
    setSignupOpen(true);
  }

  return (
    <main className="flex flex-col h-[100dvh]">
      <header className="border-b border-gold/20 px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
        <Link
          href="/"
          className="font-serif text-lg sm:text-2xl gold-text tracking-wide whitespace-nowrap"
        >
          MR. CAMDEN
        </Link>

        <div className="hidden sm:flex items-center gap-4">
          <LanguageSwitcher currentLocale={locale} />
          <button
            type="button"
            onClick={openPricing}
            className="text-sm text-white/60 hover:text-gold transition"
          >
            {tNav("pricing")}
          </button>
          <Link
            href="/login"
            className="text-sm border border-gold/30 hover:border-gold/70 hover:bg-gold/5 rounded-sm px-3 py-2 min-h-[44px] flex items-center text-gold"
          >
            {tNav("login")}
          </Link>
        </div>

        <div className="sm:hidden relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Open menu"
            className="flex items-center justify-center w-11 h-11 rounded-full border border-gold/40 hover:border-gold/80 hover:bg-gold/5 transition"
          >
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
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="w-full flex items-center justify-center px-3 py-3 rounded-sm border border-gold/40 text-gold hover:bg-gold/5 transition"
                >
                  {tNav("login")}
                </Link>
                <button
                  type="button"
                  onClick={openPricing}
                  className="w-full flex items-center justify-between px-3 py-3 rounded-sm border border-gold/30 hover:border-gold/70 hover:bg-gold/5 transition text-white/80"
                >
                  <span className="text-sm">{tNav("pricing")}</span>
                </button>
                <div className="flex items-center justify-between px-3 py-2 rounded-sm border border-white/10">
                  <span className="text-white/50 text-xs uppercase tracking-widest">
                    Language
                  </span>
                  <LanguageSwitcher currentLocale={locale} />
                </div>
              </div>
            </>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {seeded.map((m, i) => (
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
                    {tChat("credit")}
                  </p>
                )}
                <p className="whitespace-pre-wrap text-white/90">{m.content}</p>
              </div>
            </div>
          ))}
          {pricingThinking && (
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
          {showPricing && (
            <div className="flex justify-start">
              <div className="max-w-[85%] bg-gold/5 border border-gold/40 px-5 py-4 rounded-sm">
                <p className="text-xs uppercase tracking-widest text-gold mb-2">
                  {tChat("credit")}
                </p>
                <p className="whitespace-pre-wrap text-white/90 mb-4">
                  {tHome("pricingPitch")}
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => setSignupOpen(true)}
                    className="flex-1 bg-gold-gradient text-bg font-semibold px-4 py-3 rounded-sm"
                  >
                    {tHome("upsellBuy")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignupOpen(true)}
                    className="flex-1 border border-gold/60 text-gold hover:bg-gold/10 font-semibold px-4 py-3 rounded-sm"
                  >
                    {tHome("upsellPro")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <form
        onSubmit={trySend}
        className="border-t border-gold/20 px-3 sm:px-4 py-4 bg-bg"
      >
        <div className="max-w-3xl mx-auto mb-3">
          <div className="flex items-center justify-between mb-1 text-xs">
            <span className="uppercase tracking-widest text-gold/80">
              {tChat("truthDial")}
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
            value={2}
            disabled
            readOnly
            className="truth-slider truth-slider--locked w-full"
          />
          <div className="flex justify-between text-[10px] uppercase tracking-widest mt-1">
            <span className="text-white/20 line-through">{tChat("useless")}</span>
            <span className="text-white/20 line-through">{tChat("soft")}</span>
            <span className="text-gold">{tChat("real")}</span>
          </div>
        </div>
        <div className="max-w-3xl mx-auto flex gap-2 sm:gap-3">
          <input
            type="text"
            value={input}
            maxLength={1000}
            onChange={(e) => setInput(e.target.value)}
            placeholder={tChat("empty")}
            className="flex-1 min-w-0 bg-black/50 border border-white/10 rounded-sm px-3 sm:px-4 py-3 text-white focus:border-gold outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || input.length > 1000}
            className="bg-gold-gradient text-bg font-semibold px-4 sm:px-6 py-3 rounded-sm disabled:opacity-30 shrink-0"
          >
            {tChat("send")}
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

      <SignupModal
        open={signupOpen}
        onClose={() => setSignupOpen(false)}
        pendingQuestion={input.trim()}
      />
    </main>
  );
}
