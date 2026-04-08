"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import LanguageSwitcher from "./LanguageSwitcher";
import SignupModal from "./SignupModal";

type Msg = { role: "user" | "assistant"; content: string };

export default function HomeChatClient({ locale }: { locale: string }) {
  const tNav = useTranslations("nav");
  const tChat = useTranslations("chat");
  const tDemo = useTranslations("demo");

  const seeded: Msg[] = [
    { role: "user", content: tDemo("question") },
    { role: "assistant", content: tDemo("answers.real.text") },
  ];

  const [input, setInput] = useState("");
  const [signupOpen, setSignupOpen] = useState(false);

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
        <div className="flex items-center gap-3 sm:gap-4">
          <LanguageSwitcher currentLocale={locale} />
          <Link
            href="/pricing"
            className="hidden sm:inline text-sm text-white/60 hover:text-gold transition"
          >
            {tNav("pricing")}
          </Link>
          <Link
            href="/login"
            className="text-sm border border-gold/30 hover:border-gold/70 hover:bg-gold/5 rounded-sm px-3 py-2 min-h-[44px] flex items-center text-gold"
          >
            {tNav("login")}
          </Link>
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
        </div>
      </div>

      <form
        onSubmit={trySend}
        className="border-t border-gold/20 px-3 sm:px-4 py-4 bg-bg"
      >
        <div className="max-w-3xl mx-auto flex gap-2 sm:gap-3">
          <input
            type="text"
            value={input}
            maxLength={1000}
            onChange={(e) => setInput(e.target.value)}
            placeholder={tChat("placeholder")}
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
