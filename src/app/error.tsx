"use client";
import { Character } from "@/components/Character";
import { BrandLogo } from "@/components/BrandLogo";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <main id="main" className="flex min-h-dvh flex-col items-center justify-center p-6 text-center">
      <div className="mb-4 rounded-3xl bg-white/95 p-2"><BrandLogo width={200} /></div>
      <Character name="speaky" mood="encouraging" size={150} />
      <h1 className="title-md mt-4">Something went a little wobbly.</h1>
      <p className="mt-2 text-vibe-lavender">Don't worry — it's not your fault. Let's try again!</p>
      <button onClick={reset} className="btn-primary mt-6">Try again</button>
    </main>
  );
}
