import Link from "next/link";
import { Character } from "@/components/Character";
import { PingVibeLogo } from "@/components/PingVibeLogo";

export default function NotFound() {
  return (
    <main id="main" className="flex min-h-dvh flex-col items-center justify-center bg-vibe-hero p-6 text-center">
      <div className="mb-4 rounded-3xl bg-white/95 p-2"><PingVibeLogo width={200} /></div>
      <Character name="max" mood="surprised" size={160} />
      <h1 className="title-lg mt-4">Oops! This path is lost in the clouds.</h1>
      <p className="mt-2 text-vibe-lavender">Let's head back to a place we know.</p>
      <Link href="/" className="btn-primary mt-6">Take me home</Link>
    </main>
  );
}
