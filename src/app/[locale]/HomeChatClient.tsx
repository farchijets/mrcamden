"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import LanguageSwitcher from "./LanguageSwitcher";
import Logo from "./Logo";
import { createClient } from "@/lib/supabase/client";

type Msg = { role: "user" | "assistant"; content: string };

export default function HomeChatClient({ locale }: { locale: string }) {
  const tNav = useTranslations("nav");
  const tChat = useTranslations("chat");
  const tHome = useTranslations("home.chatHome");
  const tAuth = useTranslations("auth");

  const seeded: Msg[] = [
    { role: "assistant", content: tHome("greeting") },
  ];

  const [input, setInput] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [bubbles, setBubbles] = useState<("pricing" | "login" | "signup")[]>([]);
  const [thinking, setThinking] = useState<null | "pricing" | "login" | "signup">(null);
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupSent, setSignupSent] = useState(false);
  const [pendingQ, setPendingQ] = useState<string>("");
  const [signupEmailMode, setSignupEmailMode] = useState(false);
  const [loginEmailMode, setLoginEmailMode] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  async function signInWithGoogle() {
    if (oauthLoading) return;
    setOauthLoading(true);
    if (pendingQ) {
      try { localStorage.setItem("mrcamden_pending_q", pendingQ); } catch {}
    }
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=/${locale}/chat`,
        },
      });
      if (error) {
        setOauthLoading(false);
        setSignupError(error.message);
      }
    } catch {
      setOauthLoading(false);
    }
  }
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  function openBubble(kind: "pricing" | "login" | "signup") {
    setMenuOpen(false);
    if (bubbles.includes(kind) || thinking) return;
    setThinking(kind);
    setTimeout(() => {
      setThinking(null);
      setBubbles((b) => [...b, kind]);
    }, 700);
  }
  const openPricing = () => openBubble("pricing");
  const openLogin = () => openBubble("login");
  const openSignup = () => openBubble("signup");

  async function submitSignup(e: React.FormEvent) {
    e.preventDefault();
    if (signupLoading) return;
    setSignupError(null);
    setSignupLoading(true);
    if (pendingQ) {
      try { localStorage.setItem("mrcamden_pending_q", pendingQ); } catch {}
    }
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: { emailRedirectTo: `${window.location.origin}/${locale}/chat` },
      });
      if (error) {
        setSignupError(error.message);
        setSignupLoading(false);
        return;
      }
      if (data.session) {
        window.location.href = `/${locale}/chat`;
        return;
      }
      setSignupSent(true);
      setSignupLoading(false);
    } catch {
      setSignupError("Something broke.");
      setSignupLoading(false);
    }
  }

  async function submitLogin(e: React.FormEvent) {
    e.preventDefault();
    if (loginLoading) return;
    setLoginError(null);
    setLoginLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      if (error) {
        setLoginError(error.message);
        setLoginLoading(false);
        return;
      }
      window.location.href = `/${locale}/chat`;
    } catch {
      setLoginError("Something broke.");
      setLoginLoading(false);
    }
  }

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
    setPendingQ(input.trim());
    openSignup();
  }

  return (
    <main className="flex flex-col h-[100dvh]">
      <header className="border-b border-gold/20 py-3 sm:py-4">
        <div className="max-w-3xl mx-auto px-4 flex items-center justify-between gap-2">
        <Link href="/" className="shrink-0">
          <Logo size="md" />
        </Link>

        <div className="hidden sm:flex items-center gap-4">
          <LanguageSwitcher currentLocale={locale} />
          <button
            type="button"
            onClick={openPricing}
            className="text-sm text-white/60 hover:text-gold transition px-2"
          >
            {tNav("pricing")}
          </button>
          <button
            type="button"
            onClick={openLogin}
            className="text-sm border border-gold/30 hover:border-gold/70 hover:bg-gold/5 rounded-sm px-3 py-2 min-h-[44px] flex items-center text-gold"
          >
            {tNav("login")}
          </button>
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
                <button
                  type="button"
                  onClick={openLogin}
                  className="w-full flex items-center justify-center px-3 py-3 rounded-sm border border-gold/40 text-gold hover:bg-gold/5 transition"
                >
                  {tNav("login")}
                </button>
                <button
                  type="button"
                  onClick={openPricing}
                  className="w-full flex items-center justify-center px-3 py-3 rounded-sm border border-white/10 text-white/60 hover:text-gold hover:border-gold/40 transition text-sm"
                >
                  {tNav("pricing")}
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
          {bubbles.map((kind) => (
            <div key={kind} className="flex justify-start">
              <div className={`${kind === "login" || kind === "signup" ? "max-w-[85%] w-full sm:w-[28rem]" : "max-w-[85%]"} bg-white/[0.03] border border-white/10 px-5 py-3 rounded-sm`}>
                <p className="text-xs uppercase tracking-widest text-gold mb-1">
                  {tChat("credit")}
                </p>
                {kind === "pricing" && (
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={openSignup}
                      className="group flex items-center gap-2 text-left text-white/90 hover:text-gold transition"
                    >
                      <span>{tHome("packEntry")}</span>
                      <span aria-hidden className="text-gold/60 group-hover:text-gold transition-transform group-hover:translate-x-0.5">›</span>
                    </button>
                    <button
                      type="button"
                      onClick={openSignup}
                      className="group flex items-center gap-2 text-left text-white/90 hover:text-gold transition"
                    >
                      <span>{tHome("packBulk")}</span>
                      <span aria-hidden className="text-gold/60 group-hover:text-gold transition-transform group-hover:translate-x-0.5">›</span>
                    </button>
                  </div>
                )}
                {kind === "signup" && (
                  <>
                    {signupSent ? (
                      <>
                        <p className="text-white/90 font-serif text-lg mb-1">
                          {tAuth("checkEmailTitle")}
                        </p>
                        <p className="text-white/70 text-sm">
                          {tAuth("checkEmailBody", { email: signupEmail })}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-white/90 mb-3">{tHome("signupSubtitle")}</p>
                        <button
                          type="button"
                          onClick={signInWithGoogle}
                          disabled={oauthLoading}
                          className="w-full flex items-center justify-center gap-3 bg-white text-black font-medium px-4 py-3 rounded-sm hover:bg-white/90 disabled:opacity-60 transition"
                        >
                          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
                            <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                            <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                            <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                            <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
                          </svg>
                          {tAuth("continueWithGoogle")}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSignupEmailMode((v) => !v)}
                          className="w-full text-center text-xs text-white/50 hover:text-white/80 mt-2 transition"
                        >
                          {tAuth("orUseEmail")}
                        </button>
                        {signupEmailMode && (
                        <form onSubmit={submitSignup} className="space-y-2 mt-3">
                          <input
                            type="email"
                            required
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                            placeholder="email@example.com"
                            className="w-full bg-black/50 border border-white/10 rounded-sm px-3 py-2 text-white focus:border-gold outline-none text-sm"
                          />
                          <input
                            type="password"
                            required
                            minLength={6}
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-black/50 border border-white/10 rounded-sm px-3 py-2 text-white focus:border-gold outline-none text-sm"
                          />
                          {signupError && (
                            <p className="text-red-400 text-xs">{signupError}</p>
                          )}
                          <button
                            type="submit"
                            disabled={signupLoading}
                            className="group flex items-center gap-2 text-white/90 hover:text-gold disabled:opacity-50 transition"
                          >
                            <span>{signupLoading ? tAuth("creating") : tAuth("create")}</span>
                            <span aria-hidden className="text-gold/60 group-hover:text-gold transition-transform group-hover:translate-x-0.5">›</span>
                          </button>
                        </form>
                        )}
                      </>
                    )}
                  </>
                )}
                {kind === "login" && (
                  <>
                    <p className="text-white/90 mb-3">{tHome("loginPrompt")}</p>
                    <button
                      type="button"
                      onClick={signInWithGoogle}
                      disabled={oauthLoading}
                      className="w-full flex items-center justify-center gap-3 bg-white text-black font-medium px-4 py-3 rounded-sm hover:bg-white/90 disabled:opacity-60 transition"
                    >
                      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
                        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
                      </svg>
                      {tAuth("continueWithGoogle")}
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoginEmailMode((v) => !v)}
                      className="w-full text-center text-xs text-white/50 hover:text-white/80 mt-2 transition"
                    >
                      {tAuth("orUseEmail")}
                    </button>
                    {loginEmailMode && (
                    <form onSubmit={submitLogin} className="space-y-2 mt-3">
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="w-full bg-black/50 border border-white/10 rounded-sm px-3 py-2 text-white focus:border-gold outline-none text-sm"
                      />
                      <input
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-black/50 border border-white/10 rounded-sm px-3 py-2 text-white focus:border-gold outline-none text-sm"
                      />
                      {loginError && (
                        <p className="text-red-400 text-xs">{loginError}</p>
                      )}
                      <button
                        type="submit"
                        disabled={loginLoading}
                        className="group flex items-center gap-2 text-white/90 hover:text-gold disabled:opacity-50 transition"
                      >
                        <span>{loginLoading ? tHome("loginSubmitting") : tHome("loginSubmit")}</span>
                        <span aria-hidden className="text-gold/60 group-hover:text-gold transition-transform group-hover:translate-x-0.5">›</span>
                      </button>
                    </form>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex justify-start">
              <div className="bg-white/[0.03] border border-white/10 px-5 py-4 rounded-sm">
                <div className="flex gap-2">
                  <span className="w-2 h-2 rounded-full bg-gold animate-pulse-dot" />
                  <span className="w-2 h-2 rounded-full bg-gold animate-pulse-dot" style={{ animationDelay: "0.2s" }} />
                  <span className="w-2 h-2 rounded-full bg-gold animate-pulse-dot" style={{ animationDelay: "0.4s" }} />
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
        <div className="max-w-3xl mx-auto mt-2 flex items-center justify-between gap-3">
          <p className="text-[13px] text-white/40 italic">
            {tChat("notSavedDisclaimer")}
          </p>
          <span
            className={`text-xs tabular-nums ${
              input.length >= 950
                ? "text-red-400"
                : input.length >= 900
                  ? "text-gold"
                  : "text-white/40"
            }`}
          >
            {input.length} / 1000
          </span>
        </div>
      </form>

    </main>
  );
}
