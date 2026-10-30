import Link from "next/link";
import { requireParent } from "@/server/session";
import { query } from "@/server/db";
import { ConsentForm } from "@/components/parent/ConsentForm";
import { CharacterSays } from "@/components/ui";

export const metadata = { title: "Parental consent" };

export default async function ConsentPage() {
  const p = await requireParent();
  const pending = await query<{ id: string; display_name: string }>(`select id, display_name from children where parent_id = $1 and status = 'pending_consent' order by created_at`, [p.id]);
  return (
    <div className="space-y-6">
      <CharacterSays who="grammy" mood="explaining">E-mail verified ✅ Now let's keep your Explorer safe: review consent and choose a secret PIN.</CharacterSays>
      {pending.length === 0 && <div className="card p-6"><p>All your Explorers are set up.</p><Link href="/parent" className="btn-primary mt-4">Go to dashboard</Link></div>}
      {pending.map((c) => <ConsentForm key={c.id} child={{ id: c.id, name: c.display_name }} />)}
    </div>
  );
}
