"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/client";
import { CharacterSays, ErrorNote } from "@/components/ui";

export function ConsentForm({ child }: { child: { id: string; name: string } }) {
  const router = useRouter();
  const [c, setC] = useState({ learning_data: false, ai_feedback: true, speech_in_browser: true });
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pin !== pin2) return setError("The two PINs don't match.");
    setBusy(true); setError(null);
    try { const r = await api<{ username: string }>("/api/parent/consent", { body: { childId: child.id, pin, consents: c } }); setDone(r.username); }
    catch (err) { setError((err as Error).message); } finally { setBusy(false); }
  }
  async function launch() {
    const r = await api<{ redirect: string }>("/api/parent/launch", { body: { childId: child.id } });
    window.location.assign(r.redirect);
  }

  if (done) {
    return (
      <div className="card p-6">
        <CharacterSays who="max" mood="celebrating">{child.name}'s account is ready!</CharacterSays>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="glass p-4"><div className="text-xs uppercase text-vibe-lavender">Login name</div><div className="font-display text-2xl font-bold text-vibe-sun-ink" data-testid="explorer-name">{done}</div></div>
          <div className="glass p-4"><div className="text-xs uppercase text-vibe-lavender">Secret PIN</div><div className="font-display text-2xl font-bold">The 6 digits you chose</div></div>
        </div>
        <p className="mt-3 text-sm text-vibe-lavender">Write these down for {child.name}. The login name is only for signing in and never contains their real name, for privacy. Inside PING VIBE we always greet {child.name} by name. You can reset the PIN anytime.</p>
        <div className="mt-5 flex flex-wrap gap-3"><button onClick={launch} className="btn-primary">Hand the device to {child.name} 🚀</button><button onClick={() => { router.push("/parent"); router.refresh(); }} className="btn-ghost">Go to parent dashboard</button></div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-5 p-6" data-child-id={child.id}>
      <h2 className="title-md">Parental consent for {child.name}</h2>
      <p className="text-sm text-vibe-lavender">Under India's Digital Personal Data Protection Act, 2023 we need your verifiable consent before {child.name} can use PING VIBE. Read the <a href="/privacy" target="_blank" className="text-vibe-aqua-ink underline">privacy notice</a>.</p>
      {[
        ["learning_data", "Required", `I consent to PING VIBE processing ${child.name}'s first name, birth month/year, grade and learning records to provide personalised English learning.`],
        ["ai_feedback", "Optional", `Allow AI feedback: ${child.name}'s writing and questions to LEXI may be sent securely to our AI provider to generate feedback. (If off, the offline checker is used and LEXI chat is disabled.)`],
        ["speech_in_browser", "Optional", "Allow the Speaking Arena to use the microphone. Speech is recognised inside the browser; no recordings are stored by PING VIBE."],
      ].map(([k, tag, text]) => (
        <label key={k} className="glass flex gap-3 p-4 text-sm">
          <input type="checkbox" className="mt-1 h-5 w-5 shrink-0 accent-vibe-purple" checked={(c as any)[k]} onChange={(e) => setC({ ...c, [k]: e.target.checked })} />
          <span><span className={`chip mr-2 ${tag === "Required" ? "text-vibe-coral-ink" : ""}`}>{tag}</span>{text}</span>
        </label>
      ))}
      <div className="grid gap-3 sm:grid-cols-2">
        <div><label className="label" htmlFor={`pin-${child.id}`}>Set {child.name}'s secret PIN (6 digits)</label><input id={`pin-${child.id}`} className="input text-center text-xl tracking-[0.5em]" inputMode="numeric" type="password" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))} /></div>
        <div><label className="label" htmlFor={`pin2-${child.id}`}>Repeat the PIN</label><input id={`pin2-${child.id}`} className="input text-center text-xl tracking-[0.5em]" inputMode="numeric" type="password" value={pin2} onChange={(e) => setPin2(e.target.value.replace(/\D/g, "").slice(0, 6))} /></div>
      </div>
      <ErrorNote error={error} />
      <button className="btn-primary" disabled={busy || !c.learning_data}>{busy ? "Saving…" : "Give consent & create Explorer account"}</button>
    </form>
  );
}
