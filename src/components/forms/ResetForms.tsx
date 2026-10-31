"use client";
import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/client";
import { ErrorNote } from "@/components/ui";

export function ForgotForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState<{ devMailbox: boolean } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  return (
    <form className="card space-y-4 p-6 sm:p-8" onSubmit={async (e) => { e.preventDefault(); setErr(null); try { setDone(await api("/api/auth/forgot", { body: { email } })); } catch (x) { setErr((x as Error).message); } }}>
      <h1 className="title-lg">Forgot your password?</h1>
      {done ? (
        <p className="text-vibe-lavender">If an account exists for <b>{email}</b>, we've sent a reset link. It expires in 1 hour.{done.devMailbox && <> (Developer mode: see the <Link className="text-vibe-aqua-ink underline" href="/dev/mailbox">mailbox</Link>.)</>}</p>
      ) : (
        <>
          <p className="text-sm text-vibe-lavender">Enter your parent e-mail and we'll send you a reset link. (Explorers: ask your parent to reset your PIN.)</p>
          <div><label className="label" htmlFor="femail">E-mail</label><input id="femail" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></div>
          <ErrorNote error={err} /><button className="btn-primary w-full">Send reset link</button>
        </>
      )}
      <p className="text-center text-sm"><Link href="/login?as=parent" className="text-vibe-aqua-ink">Back to login</Link></p>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <form className="card space-y-4 p-6 sm:p-8" onSubmit={async (e) => { e.preventDefault(); setErr(null); if (pw !== pw2) return setErr("The passwords don't match."); try { await api("/api/auth/reset", { body: { token, password: pw } }); setDone(true); } catch (x) { setErr((x as Error).message); } }}>
      <h1 className="title-lg">Choose a new password</h1>
      {done ? <><p className="text-vibe-mint-ink">Password updated ✅ All devices were signed out for safety.</p><Link href="/login?as=parent" className="btn-primary">Log in</Link></> : (
        <>
          <div><label className="label" htmlFor="npw">New password</label><input id="npw" type="password" className="input" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" placeholder="8+ characters, with a number" /></div>
          <div><label className="label" htmlFor="npw2">Repeat new password</label><input id="npw2" type="password" className="input" value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" /></div>
          <ErrorNote error={err} /><button className="btn-primary w-full" disabled={!token}>Update password</button>
        </>
      )}
    </form>
  );
}
