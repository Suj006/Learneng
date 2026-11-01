import Link from "next/link";
import { NotebookClient } from "./NotebookClient";
import { PageTitle } from "@/components/ui";
export const metadata = { title: "Vocabulary Notebook" };
export default function Notebook() { return <><PageTitle title="📒 My Vocabulary Notebook" subtitle="Search, revise, favourite and listen to every word you've discovered." right={<span className="flex gap-2"><Link href="/world/word-scenes" className="btn-ghost btn-sm">🖼️ Word Scenes</Link><Link href="/world/discoveries" className="btn-ghost btn-sm">🔍 My Learning Discoveries</Link></span>} /><NotebookClient /></>; }
