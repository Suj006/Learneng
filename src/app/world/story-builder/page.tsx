import Link from "next/link";
import { requireChild } from "@/server/session";
import { query } from "@/server/db";
import { STORY_BUILDER } from "@/server/content/catalog";
import { bandForGrade } from "@/lib/grades";
import { PageTitle } from "@/components/ui";
import { StoryBuilderClient } from "./StoryBuilderClient";

export const metadata = { title: "Story Builder" };
export default async function StoryBuilder() {
  const child = await requireChild();
  const band = bandForGrade(child.grade);
  // Personal Story Gallery: the child's own saved Story Builder stories (private to the child and their parent).
  const gallery = await query<{ id: string; title: string; content: string; status: string; score: number | null; meta: Record<string, string>; updated_at: string }>(
    `select w.id, w.title, w.content, w.status, e.score, w.prompt_meta meta, to_char(w.updated_at,'YYYY-MM-DD') updated_at
       from writing_submissions w left join writing_evaluations e on e.submission_id = w.id
      where w.child_id = $1 and w.kind = 'story_builder' and w.word_count > 0 order by w.updated_at desc limit 24`, [child.id]);
  return (
    <>
      <PageTitle title="📜 Story Builder" subtitle="Spin the story wheels, then write — or tell — a story using all three!" back="/world/writing" />
      <StoryBuilderClient pools={STORY_BUILDER} minWords={[0, 15, 30, 70, 140][band]} />
      <section className="mt-12" data-testid="story-gallery">
        <h2 className="title-md">🖼️ My Story Gallery</h2>
        {gallery.length === 0 ? <p className="mt-2 text-sm text-vibe-lavender">Your stories will appear here once you save them.</p> : (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.map((g) => (
              <li key={g.id}><Link href={`/world/writing/${g.id}?mine=1`} className="card block p-4 transition hover:-translate-y-1">
                <p className="text-xs text-vibe-lavender">{[g.meta?.character, g.meta?.location, g.meta?.object].filter(Boolean).join(" · ")}</p>
                <b className="font-display text-lg">{g.title}</b>
                <p className="mt-1 line-clamp-3 text-sm">{g.content}</p>
                <div className="mt-2 flex gap-2 text-xs"><span className="chip">{g.status === "evaluated" ? `⭐ ${g.score ?? "—"}` : "Draft"}</span><span className="chip">{g.updated_at}</span></div>
              </Link></li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
