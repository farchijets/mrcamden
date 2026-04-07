"use client";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
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
      router.push("/chat");
      router.refresh();
      return;
    }
    setSent(true);
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <h1 className="text-center font-serif text-4xl gold-text mb-2">
          {t("signupTitle")}
        </h1>
        <p className="text-center text-white/60 mb-8">{t("signupSubtitle")}</p>
        {sent ? (
          <div className="rounded-sm border border-gold/20 bg-white/[0.02] p-6 text-center">
            <p className="font-serif text-2xl gold-text mb-3">
              {t("checkEmailTitle")}
            </p>
            <p className="text-white/70 text-sm">
              {t("checkEmailBody", { email })}
            </p>
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="space-y-4 rounded-sm border border-gold/20 bg-white/[0.02] p-6"
          >
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
          </form>
        )}
        <p className="text-center text-white/60 mt-6 text-sm">
          {t("haveAccount")}{" "}
          <Link href="/login" className="text-gold hover:underline">
            {t("signInLink")}
          </Link>
        </p>
      </div>
    </main>
  );
}
