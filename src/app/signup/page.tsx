"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
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
      options: { emailRedirectTo: `${window.location.origin}/chat` },
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
          Get 3 free messages
        </h1>
        <p className="text-center text-white/60 mb-8">
          Prepare to be unflattered.
        </p>
        {sent ? (
          <div className="rounded-sm border border-gold/20 bg-white/[0.02] p-6 text-center">
            <p className="font-serif text-2xl gold-text mb-3">Check your email</p>
            <p className="text-white/70 text-sm">
              We sent a confirmation link to <span className="text-gold">{email}</span>.
              Click it to activate your account and claim your 3 free messages.
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
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-gold outline-none"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password (6+ chars)"
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
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>
        )}
        <p className="text-center text-white/60 mt-6 text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-gold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
