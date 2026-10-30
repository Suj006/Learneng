import { notFound } from "next/navigation";
import { requireChild } from "@/server/session";
import { one } from "@/server/db";
import { PageTitle } from "@/components/ui";
import { WritingCanvas } from "@/components/play/WritingCanvas";

export default async function WriteTopic({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ mine?: string }> }) {
  const { id } = await params;
  const { mine } = await searchParams;
  const child = await requireChild();
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  if (mine) {
    const s = await one<{ id: string; title: string; content: string; status: string; topic_id: string | null; kind: string; prompt_meta: Record<string, string>; feedback: any; evaluator: string | null }>(
      `select w.id, w.title, w.content, w.status, w.topic_id, w.kind, w.prompt_meta, e.feedback, e.evaluator from writing_submissions w left join writing_evaluations e on e.submission_id = w.id where w.id = $1 and w.child_id = $2`, [id, child.id]);
    if (!s) notFound();
    const t = s.topic_id ? await one<{ id: string; title: string; prompt: string; min_words: number; suggested_words: string[]; emoji: string }>(`select id, title, prompt, min_words, suggested_words, emoji from writing_topics where id = $1`, [s.topic_id]) : null;
    return <><PageTitle title={`${t?.emoji ?? "📜"} ${s.title}`} back="/world/writing" />
      <WritingCanvas kind={s.kind as "topic" | "story_builder"} topic={t ? { id: t.id, title: t.title, prompt: t.prompt, minWords: t.min_words, words: t.suggested_words } : { id: null, title: s.title, prompt: "Your story", minWords: 40, words: [] }} existing={{ id: s.id, content: s.content, status: s.status, feedback: s.feedback, evaluator: s.evaluator }} /></>;
  }
  const t = await one<{ id: string; title: string; prompt: string; min_words: number; suggested_words: string[]; emoji: string; mode: string }>(`select id, title, prompt, min_words, suggested_words, emoji, mode from writing_topics where id = $1 and active`, [id]);
  if (!t) notFound();
  return <><PageTitle title={`${t.emoji} ${t.title}`} back="/world/writing" /><WritingCanvas kind="topic" topic={{ id: t.id, title: t.title, prompt: t.prompt, minWords: t.min_words, words: t.suggested_words }} /></>;
}
