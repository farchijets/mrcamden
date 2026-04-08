import { setRequestLocale } from "next-intl/server";
import { redirect } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/server";
import HomeChatClient from "./HomeChatClient";

export const dynamic = "force-dynamic";

export default async function Home({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect({ href: "/chat", locale: params.locale });

  return <HomeChatClient locale={params.locale} />;
}
