"use client";
import { useState } from "react";
import { Character } from "@/components/Character";
import { api, speak } from "@/lib/client";

const SUGGEST = ["What does magnificent mean?", "How do you spell rainbow?", "What is the opposite of brave?", "When do I use 'an'?"];

export function CompanionChat({ name, ai }: { name: string; ai: boolean }) {
  const [msgs, setMsgs] = useState<{ from: "me" | "lexi"; text: string }[]>([{ from: "lexi", text: `Hi ${name}! I'm LEXI. Ask me about any English word!` }]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  async function ask(text: string) {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { from: "me", text }]); setQ(""); setBusy(true);
    try { const r = await api<{ reply: string }>("/api/companion", { body: { question: text } }); setMsgs((m) => [...m, { from: "lexi", text: r.reply }]); }
    catch (e) { setMsgs((m) => [...m, { from: "lexi", text: (e as Error).message }]); } finally { setBusy(false); }
  }
  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <div className="hidden lg:block"><Character name="lexi" mood={busy ? "thinking" : "explaining"} size={200} /></div>
      <div className="card flex h-[65vh] flex-col p-4">
        <div className="flex-1 space-y-3 overflow-y-auto pr-1" aria-live="polite">
          {msgs.map((m, i) => (
            <div key={i} className={`flex ${m.from === "me" ? "justify-end" : ""}`}>
              <div className={`max-w-[85%] rounded-3xl px-4 py-3 ${m.from === "me" ? "bg-vibe-purple text-white" : "bg-white text-vibe-midnight"}`}>
                {m.text}{m.from === "lexi" && <button className="ml-1 inline-flex h-10 w-10 items-center justify-center rounded-full align-middle text-base hover:bg-white/10" aria-label="Read aloud" onClick={() => speak(m.text, { who: "lexi", rate: 1 })}>🔊</button>}
              </div>
            </div>
          ))}
          {busy && <div className="text-sm text-vibe-lavender">LEXI is thinking… 🤖</div>}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">{SUGGEST.map((s) => <button key={s} className="chip hover:bg-white/20" onClick={() => ask(s)}>{s}</button>)}</div>
        <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); ask(q); }}>
          <input className="input" value={q} onChange={(e) => setQ(e.target.value)} maxLength={300} placeholder="Ask LEXI about a word…" aria-label="Your question" />
          <button className="btn-primary" disabled={busy}>Ask</button>
        </form>
        <p className="mt-2 text-[11px] text-vibe-lavender/70">{ai ? "LEXI uses AI with strict child-safety rules. Chats are not saved." : "LEXI is in word-bank mode (answers from the PING VIBE dictionary)."} Never share your full name, school, address or phone number.</p>
      </div>
    </div>
  );
}
