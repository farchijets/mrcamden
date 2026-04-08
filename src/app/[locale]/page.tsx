import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import TruthDemo from "./TruthDemo";
import LanguageSwitcher from "./LanguageSwitcher";

export default async function Home({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  const t = await getTranslations("home");
  const tNav = await getTranslations("nav");

  const sampleKeys = ["wasted", "ex", "amazing"] as const;

  return (
    <main className="relative min-h-screen overflow-hidden">
      <nav className="absolute top-0 right-0 left-0 z-10 flex flex-wrap items-center justify-end gap-3 sm:gap-6 px-4 sm:px-6 py-4 sm:py-6 text-sm">
        <LanguageSwitcher currentLocale={params.locale} />
        <Link href="/pricing" className="text-white/60 hover:text-gold transition">
          {tNav("pricing")}
        </Link>
        <Link href="/login" className="text-white/60 hover:text-gold transition">
          {tNav("login")}
        </Link>
      </nav>
      <div className="mx-auto max-w-5xl px-4 sm:px-6 pt-24 pb-16 sm:py-20 md:py-28">
        <div className="animate-fade-in-up text-center">
          <p className="mb-4 text-xs uppercase tracking-[0.3em] text-gold/80">
            {t("tagline")}
          </p>
          <h1 className="font-serif text-5xl sm:text-6xl md:text-8xl font-bold tracking-tight gold-text">
            {t("title")}
          </h1>
          <p className="mt-6 text-lg sm:text-xl md:text-2xl text-white/80 italic font-serif px-2">
            {t("subtitle")}
          </p>
          <div className="mt-10 px-2">
            <Link
              href="/signup"
              className="inline-block w-full sm:w-auto rounded-sm border border-gold bg-gold-gradient px-8 py-4 font-semibold text-bg shadow-lg shadow-gold/20 transition hover:brightness-110"
            >
              {t("cta")}
            </Link>
          </div>
        </div>

        <TruthDemo />

        <div className="mt-24 grid gap-6 md:grid-cols-3">
          {sampleKeys.map((key, i) => (
            <div
              key={key}
              className="animate-fade-in-up rounded-sm border border-gold/20 bg-white/[0.02] p-6 backdrop-blur-sm"
              style={{ animationDelay: `${0.2 + i * 0.15}s` }}
            >
              <p className="mb-3 text-sm text-white/50">{t("youAsked")}</p>
              <p className="mb-5 font-serif text-lg text-white">
                &ldquo;{t(`samples.${key}.q`)}&rdquo;
              </p>
              <div className="border-t border-gold/20 pt-4">
                <p className="mb-2 text-xs uppercase tracking-widest text-gold">
                  {t("credit")}
                </p>
                <p className="text-white/80 leading-relaxed">
                  {t(`samples.${key}.a`)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-20 text-center text-xs text-white/40">{t("footer")}</p>
      </div>
    </main>
  );
}
