"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

type Msg = { role: "user" | "assistant"; content: string };

export default function ChatClient({
  initialCredits,
}: {
  initialCredits: number;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [credits, setCredits] = useState(initialCredits);
  const [loading, setLoading] = useState(false);
  const [outOfCredits, setOutOfCredits] = useState(initialCredits <= 0);
  const [truth, setTruth] = useState(5);

  const truthLabel =
    truth <= 3 ? "Gentle" : truth <= 6 ? "Real" : truth <= 8 ? "Blunt" : "Brutal";
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading || outOfCredits) return;

    const userMsg: Msg = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, truth }),
      });

      if (res.status === 402) {
        setOutOfCredits(true);
        setCredits(0);
        return;
      }

      const data = await res.json();
      if (data.message) {
        setMessages([...newMessages, data.message]);
        if (typeof data.credits === "number") {
          setCredits(data.credits);
          if (data.credits <= 0) setOutOfCredits(true);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-col h-screen">
      <header className="border-b border-gold/20 px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="font-serif text-2xl gold-text tracking-wide"
        >
          MR. CAMDEN
        </Link>
        <div className="text-sm">
          <span className="text-white/50">Credits: </span>
          <span className="text-gold font-semibold">{credits}</span>
        </div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-white/40 mt-12">
              <p className="font-serif text-xl">Ask. Brace yourself.</p>
            </div>
          )}
          {messages.map((m, i) => (
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
                    Mr. Camden
                  </p>
                )}
                <p className="whitespace-pre-wrap text-white/90">
                  {m.content}
                </p>
              </div>
            </div>
          ))}
          {loading && (
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
          {outOfCredits && (
            <div className="mt-8 rounded-sm border border-gold/40 bg-gold/5 p-6 text-center">
              <p className="font-serif text-2xl gold-text mb-2">
                Out of credits.
              </p>
              <p className="text-white/70 mb-4">
                The truth isn&rsquo;t free. Grab more.
              </p>
              <Link
                href="/pricing"
                className="inline-block bg-gold-gradient text-bg font-semibold px-6 py-3 rounded-sm"
              >
                See Pricing
              </Link>
            </div>
          )}
        </div>
      </div>

      <form
        onSubmit={send}
        className="border-t border-gold/20 px-4 py-4 bg-bg"
      >
        <div className="max-w-3xl mx-auto mb-3">
          <div className="flex items-center justify-between mb-1 text-xs">
            <span className="uppercase tracking-widest text-gold/80">Truth Dial</span>
            <span className="text-gold font-semibold">
              {truth}/10 — {truthLabel}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            step={1}
            value={truth}
            onChange={(e) => setTruth(Number(e.target.value))}
            className="truth-slider w-full"
          />
          <div className="flex justify-between text-[10px] text-white/40 uppercase tracking-widest mt-1">
            <span>Gentle</span>
            <span>Real</span>
            <span>Brutal</span>
          </div>
        </div>
        <div className="max-w-3xl mx-auto flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              outOfCredits ? "Out of credits" : "Tell me what's on your mind..."
            }
            disabled={outOfCredits || loading}
            className="flex-1 bg-black/50 border border-white/10 rounded-sm px-4 py-3 text-white focus:border-gold outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={outOfCredits || loading || !input.trim()}
            className="bg-gold-gradient text-bg font-semibold px-6 rounded-sm disabled:opacity-30"
          >
            Send
          </button>
        </div>
      </form>
    </main>
  );
}
