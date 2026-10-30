import { notFound } from "next/navigation";
import { query } from "@/server/db";
import { devMailboxEnabled } from "@/server/email";

export const dynamic = "force-dynamic";

/** Development-only inbox used when no e-mail provider is configured. Disabled in production. */
export default async function DevMailbox() {
  if (!devMailboxEnabled()) notFound();
  const mails = await query<{ id: string; to_email: string; subject: string; html: string; created_at: string }>(`select * from dev_mailbox order by created_at desc limit 20`);
  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="title-lg">Developer mailbox</h1>
      <p className="mt-1 text-sm text-vibe-lavender">Visible only in development. Configure RESEND_API_KEY to send real e-mail.</p>
      <div className="mt-6 space-y-6">
        {mails.length === 0 && <p className="text-vibe-lavender">No e-mails yet.</p>}
        {mails.map((m) => (
          <article key={m.id} className="card overflow-hidden">
            <header className="border-b border-white/10 p-4 text-sm"><b>{m.subject}</b><div className="text-vibe-lavender">to {m.to_email} · {new Date(m.created_at).toLocaleString()}</div></header>
            <div className="bg-white" dangerouslySetInnerHTML={{ __html: m.html }} />
          </article>
        ))}
      </div>
    </main>
  );
}
