import { redirect } from "@/i18n/routing";
import { setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import ChatClient from "./ChatClient";

export const dynamic = "force-dynamic";

export default async function ChatPage({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect({ href: "/login", locale: params.locale });

  const { data: profile } = await supabase
    .from("profiles")
    .select("credits")
    .eq("id", user!.id)
    .single();

  return (
    <ChatClient
      initialCredits={profile?.credits ?? 0}
      locale={params.locale}
    />
  );
}
