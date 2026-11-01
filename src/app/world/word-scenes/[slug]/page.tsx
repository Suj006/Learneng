import { notFound } from "next/navigation";
import { requireChild } from "@/server/session";
import { SCENES, levelFor } from "@/lib/scenes";
import { bandForGrade } from "@/lib/grades";
import { PageTitle } from "@/components/ui";
import { ScenePlayer } from "./ScenePlayer";

export default async function ScenePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const child = await requireChild();
  const s = SCENES.find((x) => x.slug === slug);
  if (!s) notFound();
  const level = levelFor(bandForGrade(child.grade));
  const task = s.sentences.find((t) => t.level === level)!;
  // Answers stay on the server: send items, shuffled tiles and question options only.
  const shuffle = <T,>(a: T[]) => a.map((v, i) => [((i * 7919 + slug.length * 31) % 97), v] as const).sort((x, y) => x[0] - y[0]).map((x) => x[1]);
  const pub = {
    slug: s.slug, title: s.title, emoji: s.emoji, who: s.who, intro: s.intro, sky: s.sky, ground: s.ground, realLife: s.realLife,
    items: s.items.map((i) => ({ word: i.word, emoji: i.emoji, x: i.x, y: i.y, meaning: i.meaning, example: level === "young" ? i.young : i.older })),
    tiles: shuffle(task.tiles), hint: task.hint,
    questions: s.questions.filter((q) => q.level === level).map((q) => ({ q: q.q, options: q.options })),
    describe: level === "young" ? s.describe.young : s.describe.older, level,
  };
  return <><PageTitle title={`${s.emoji} ${s.title}`} back="/world/word-scenes" /><ScenePlayer scene={pub} /></>;
}
