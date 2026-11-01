import { notFound } from "next/navigation";
import { requireChild } from "@/server/session";
import { UNITS } from "@/lib/phonics";
import { PageTitle } from "@/components/ui";
import { PhonicsPlayer } from "./PhonicsPlayer";

export default async function PhonicsUnit({ params }: { params: Promise<{ unit: string }> }) {
  const { unit } = await params;
  await requireChild();
  const u = UNITS.find((x) => x.slug === unit);
  if (!u) notFound();
  return <><PageTitle title={`${u.emoji} ${u.title}`} subtitle={u.objective} back="/world/phonics" /><PhonicsPlayer unit={u.slug} /></>;
}
