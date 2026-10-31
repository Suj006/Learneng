import Link from "next/link";
import { NotebookClient } from "./NotebookClient";
import { PageTitle } from "@/components/ui";
export const metadata = { title: "Vocabulary Notebook" };
export default function Notebook() { return <><PageTitle title="📒 My Vocabulary Notebook" subtitle="Search, revise, favourite and listen to every word you've discovered." right={<Link href="/world/discoveries" className="btn-ghost btn-sm">🔍 My Learning Discoveries</Link>} /><NotebookClient /></>; }
