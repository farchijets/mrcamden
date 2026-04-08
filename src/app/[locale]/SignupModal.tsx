"use client";
import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";

export default function SignupModal({
  open,
  onClose,
  pendingQuestion,
}: {
  open: boolean;
  onClose: () => void;
  pendingQuestion?: string;
}) {
  const t = useTranslations("auth");
  const tHome = useTranslations("home.chatHome");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    if (pendingQuestion) {
      try {
        localStorage.setItem("mrcamden_pending_q", pendingQuestion);
      } catch {}
    }
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/${locale}/chat`,
      },
    });
    setLoading(false);
    if (error) return setErr(error.message);
    if (data.session) {
      window.location.href = `/${locale}/chat`;
      return;
    }
    setSent(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-sm border border-gold/40 bg-bg/95 p-6 sm:p-8 shadow-2xl shadow-black/60 relative max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 w-11 h-11 flex items-center justify-center text-white/60 hover:text-gold"
        >
          ✕
        </button>
        <h2 className="text-center font-serif text-3xl gold-text mb-2">
          {tHome("signupTitle")}
        </h2>
        <p className="text-center text-white/60 mb-6 text-sm">
          {tHome("signupSubtitle")}
        </p>
        {sent ? (
          <div className="text-center">
            <p className="font-serif text-2xl gold-text mb-3">
              {t("checkEmailTitle")}
            </p>
            <p className="text-white/70 text-sm">
              {t("checkEmailBody", { email })}
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <input
              type="email"
              required
              placeholder={t("emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-gold outline-none"
            />
            <input
              type="password"
              required
              minLength={6}
              placeholder={t("passwordSignupPlaceholder")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-gold outline-none"
            />
            {err && <p className="text-red-400 text-sm">{err}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gold-gradient text-bg font-semibold py-3 rounded-sm disabled:opacity-50"
            >
              {loading ? t("creating") : t("create")}
            </button>
            <p className="text-center text-white/60 text-sm">
              {t("haveAccount")}{" "}
              <Link href="/login" className="text-gold hover:underline">
                {t("signInLink")}
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
