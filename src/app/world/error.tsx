"use client";
import Link from "next/link";
import { useEffect } from "react";
import { Character } from "@/components/Character";

/**
 * Error inside the child's world. Shown INSIDE the world layout, so the header, sound button and bottom navigation
 * stay, and the child always has a clear way back to their Adventure hub. Progress is saved on the server as each
 * answer is sent, so nothing already completed is lost.
 */
export default function WorldError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("[world]", error.digest ?? error.message); }, [error]);
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center py-12 text-center">
      <Character name="max" mood="encouraging" size={150} />
      <h1 className="title-md mt-4">Whoops! This path got a little tangled.</h1>
      <p className="mt-2 text-vibe-lavender">It's not your fault, and everything you've already learned is saved. Let's try again!</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button onClick={reset} className="btn-primary">Try again</button>
        <Link href="/world" className="btn-ghost">✨ Back to my Adventure</Link>
      </div>
    </div>
  );
}
