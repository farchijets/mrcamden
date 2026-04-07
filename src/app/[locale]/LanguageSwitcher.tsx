"use client";
import { usePathname, useRouter } from "@/i18n/routing";
import { routing } from "@/i18n/routing";
import { useTransition } from "react";

const NATIVE: Record<string, string> = {
  en: "English",
  zh: "中文",
  hi: "हिन्दी",
  es: "Español",
  ar: "العربية",
  fr: "Français",
  bn: "বাংলা",
  pt: "Português",
  ru: "Русский",
  ja: "日本語",
};

export default function LanguageSwitcher({
  currentLocale,
}: {
  currentLocale: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [, startTransition] = useTransition();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value;
    // Persist preference
    document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=31536000; samesite=lax`;
    startTransition(() => {
      router.replace(pathname, { locale: next as (typeof routing.locales)[number] });
    });
  }

  return (
    <select
      value={currentLocale}
      onChange={onChange}
      aria-label="Language"
      className="bg-transparent border border-white/20 rounded-sm text-white/70 text-xs px-2 py-1 hover:text-gold hover:border-gold/40 transition cursor-pointer focus:outline-none"
    >
      {routing.locales.map((loc) => (
        <option key={loc} value={loc} className="bg-bg text-white">
          {NATIVE[loc] || loc}
        </option>
      ))}
    </select>
  );
}
