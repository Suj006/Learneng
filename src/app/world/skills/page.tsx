import { requireChild } from "@/server/session";
import { skillProfile, skillTree, STAGE_LABEL } from "@/server/skills";
import { SKILL_BRANCHES } from "@/server/content/game";
import { bandForGrade } from "@/lib/grades";
import { Character, type CharacterName } from "@/components/Character";
import { PageTitle, Progress } from "@/components/ui";

export const metadata = { title: "Skill Tree" };

export default async function Skills() {
  const child = await requireChild();
  const [tree, profile] = await Promise.all([skillTree(child.id, bandForGrade(child.grade)), skillProfile(child.id)]);
  return (
    <div>
      <PageTitle title="My English Skill Tree" subtitle="Your skills grow as you play. Every branch grows at its own speed — keep exploring!" />
      <p className="mb-4 text-xs text-vibe-lavender">Stages: 🌱 Started → 🌿 Practising → 🌳 Developing → ★ Demonstrated mastery. Stages grow from your answers, not from XP or coins.</p>
      <div className="mb-8 flex flex-wrap gap-2">{profile.map((p) => <span key={p.key} className="chip text-sm">{p.title}: <b className="text-ink">{p.growth}</b></span>)}</div>
      <div className="grid gap-6 lg:grid-cols-2">
        {SKILL_BRANCHES.map((b) => {
          const nodes = tree.filter((n) => n.branch === b.key);
          return (
            <section key={b.key} className="card p-5">
              <div className="flex items-center gap-3"><Character name={b.character as CharacterName} mood="welcome" size={56} still /><h2 className="title-md">{b.emoji} {b.title}</h2>
                <span className="chip ml-auto">{nodes.filter((n) => n.status === "mastered").length}/{nodes.length}</span></div>
              <ol className="relative mt-4 space-y-3 border-l-2 border-line/10 pl-5">
                {nodes.map((n) => (
                  <li key={n.slug} className="relative">
                    <span className={`absolute -left-[30px] top-1 grid h-6 w-6 place-items-center rounded-full text-xs ${n.status === "mastered" ? "bg-vibe-sun text-vibe-night" : n.status === "developing" ? "bg-vibe-aqua/30" : "bg-glass/10"}`}>{n.status === "mastered" ? "★" : n.status === "developing" ? "•" : "🔒"}</span>
                    <div className={n.status === "locked" ? "text-vibe-lavender" : ""}>
                      <b>{n.title}</b> <span className="chip ml-1 text-[10px]" data-stage={n.stage}>{({ ready: "", started: "🌱 ", practising: "🌿 ", developing: "🌳 ", mastered: "★ ", locked: "🔒 " } as Record<string, string>)[n.stage]}{STAGE_LABEL[n.stage]}</span> <span className="text-xs text-vibe-lavender">— {n.description}</span>
                      {n.status !== "locked" && n.status !== "mastered" && (<div className="mt-1 flex items-center gap-2 text-xs"><Progress value={n.progress} className="h-1.5 max-w-[160px]" /><span>{n.attempts}/{n.min_attempts} tries · {n.accuracy}% (need {n.min_accuracy}%)</span></div>)}
                      {n.status === "mastered" && <div className="text-xs text-vibe-sun-ink">Unlocked! {n.accuracy}% accuracy</div>}
                      {n.status === "locked" && <div className="text-xs">{n.prereq ? "Unlock the skill above first" : "Coming at a higher grade"}</div>}
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          );
        })}
      </div>
    </div>
  );
}
