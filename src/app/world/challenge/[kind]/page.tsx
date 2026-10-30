import { notFound } from "next/navigation";
import { ChallengePlayer } from "@/components/play/ChallengePlayer";
import { PageTitle } from "@/components/ui";

const META: Record<string, { title: string; guide: "max" | "lexi" | "grammy" | "speaky" | "story" }> = {
  weekly: { title: "Weekly Vocabulary Quest", guide: "lexi" }, monthly: { title: "Monthly English Championship", guide: "max" },
  special: { title: "Special Challenge", guide: "max" }, mystery: { title: "Mystery Word Challenge", guide: "lexi" },
  family: { title: "Family Challenge", guide: "max" }, boss: { title: "Mixed-Skill Boss Battle", guide: "max" },
};

export default async function ChallengePage({ params, searchParams }: { params: Promise<{ kind: string }>; searchParams: Promise<{ family?: string }> }) {
  const { kind } = await params;
  const sp = await searchParams;
  if (!META[kind]) notFound();
  if (kind === "boss") {
    return <><PageTitle title="Boss Battles" back="/world/map" /><ChallengePlayer kind="boss" refSlug="vocabulary-championship" guide="max" allowDifficulty backHref="/world/map" /></>;
  }
  return <><PageTitle title={META[kind].title} /><ChallengePlayer kind={kind} guide={META[kind].guide} familyId={sp.family} /></>;
}
