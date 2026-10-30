import { notFound } from "next/navigation";
import { requireChild } from "@/server/session";
import { timeline } from "@/server/world";
import { Logo } from "@/components/Logo";
import { PrintButton } from "./PrintButton";

export default async function Certificate({ params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  const child = await requireChild();
  const m = (await timeline(child.id)).find((t) => t.kind === kind);
  if (!m) notFound();
  return (
    <div className="mx-auto max-w-3xl">
      <div className="relative overflow-hidden rounded-[2rem] border-8 border-double border-vibe-sun bg-gradient-to-br from-[#FFF8E1] to-[#EAE4FF] p-10 text-center text-vibe-midnight print:border-4">
        <div className="mx-auto w-fit rounded-2xl bg-vibe-midnight px-4 py-2"><Logo size="sm" /></div>
        <p className="mt-6 font-display text-lg uppercase tracking-[0.3em] text-vibe-purple">Certificate of Achievement</p>
        <p className="mt-6 text-lg">This certifies that Explorer</p>
        <p className="mt-2 font-display text-5xl font-bold">{child.display_name}</p>
        <p className="mt-6 text-lg">has achieved</p>
        <p className="mt-2 font-display text-3xl font-bold text-vibe-purple">{m.emoji} {m.title}</p>
        <p className="mt-6 text-sm">on {new Date(m.achieved_at).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}</p>
        <p className="mt-8 font-display text-sm tracking-widest">YOUR WORLD. YOUR WORDS. YOUR VIBE.</p>
      </div>
      <div className="mt-6 text-center print:hidden"><PrintButton /></div>
    </div>
  );
}
