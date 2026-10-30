import Link from "next/link";
import { AuthShell } from "@/components/forms/AuthShell";
import { CharacterSays } from "@/components/ui";

export const metadata = { title: "Verify e-mail" };

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ token?: string; expired?: string }> }) {
  const { token, expired } = await searchParams;
  if (expired) {
    return (
      <AuthShell><div className="card p-8"><CharacterSays who="speaky" mood="encouraging">This link has expired or was already used. Log in as a parent to request a new one.</CharacterSays><Link href="/login?as=parent" className="btn-primary mt-4">Parent login</Link></div></AuthShell>
    );
  }
  return (
    <AuthShell>
      <div className="card p-8">
        <CharacterSays who="max" mood="excited">Thanks for joining PING VIBE! Press the button to verify your e-mail.</CharacterSays>
        {token ? <a href={`/api/auth/verify?token=${encodeURIComponent(token)}`} className="btn-primary mt-6">Verify my e-mail ✅</a> : <p className="mt-4 text-vibe-coral">Missing verification token.</p>}
      </div>
    </AuthShell>
  );
}
