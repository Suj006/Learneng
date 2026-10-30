import { requireChild } from "@/server/session";
import { STORY_BUILDER } from "@/server/content/catalog";
import { bandForGrade } from "@/lib/grades";
import { PageTitle } from "@/components/ui";
import { StoryBuilderClient } from "./StoryBuilderClient";

export const metadata = { title: "Story Builder" };
export default async function StoryBuilder() {
  const child = await requireChild();
  const band = bandForGrade(child.grade);
  return <><PageTitle title="📜 Story Builder" subtitle="Spin the story wheels, then write — or tell — a story using all three!" back="/world/writing" /><StoryBuilderClient pools={STORY_BUILDER} minWords={[0, 15, 30, 70, 140][band]} /></>;
}
