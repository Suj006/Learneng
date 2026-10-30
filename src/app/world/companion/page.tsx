import { requireChild } from "@/server/session";
import { one } from "@/server/db";
import { aiEnabled } from "@/server/ai/client";
import { CompanionChat } from "./CompanionChat";
import { CharacterSays, PageTitle } from "@/components/ui";

export const metadata = { title: "Ask LEXI" };
export default async function Companion() {
  const child = await requireChild();
  const p = await one<{ companion_enabled: boolean }>(`select companion_enabled from parents where id = $1`, [child.parent_id]);
  return (
    <>
      <PageTitle title="🤖 Ask LEXI" subtitle="Ask about English words, spelling and grammar. LEXI only talks about learning English — and never asks about you." />
      {p?.companion_enabled ? <CompanionChat name={child.display_name} ai={aiEnabled()} /> : <CharacterSays who="lexi" mood="encouraging">Your parent has switched LEXI chat off for now. You can still explore your Notebook and all the games!</CharacterSays>}
    </>
  );
}
