import Link from "next/link";
import { PingVibeLogo } from "@/components/PingVibeLogo";

export const metadata = { title: "Privacy & Parental Consent" };

export default function Privacy() {
  return (
    <main id="main" className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link href="/" className="inline-block rounded-3xl bg-white p-2"><PingVibeLogo width={220} fallback="md" /></Link>
      <h1 className="title-lg mt-8">Privacy & Parental Consent Notice</h1>
      <p className="mt-2 text-sm text-vibe-lavender">Version 2026-10-dpdp-v1 · Written in plain language for parents and guardians.</p>
      <div className="mt-8 space-y-6 leading-relaxed text-vibe-lavender">
        <section><h2 className="title-md text-white">What we collect (and nothing more)</h2><ul className="mt-2 list-disc space-y-1 pl-6">
          <li>Your child's <b>first name</b> (shown only to your child and you), <b>birth month & year</b> and <b>grade</b> — to choose age-appropriate content.</li>
          <li>Your <b>e-mail</b> and a securely hashed password — to verify you are the parent and to send reports you ask for.</li>
          <li><b>Learning records</b>: words practised, scores, writing your child submits, time spent — to personalise learning and show you progress.</li>
        </ul></section>
        <section><h2 className="title-md text-white">What we never do</h2><ul className="mt-2 list-disc space-y-1 pl-6">
          <li>No advertising, no tracking for ads, no selling or sharing data.</li>
          <li>No public profiles, public leaderboards, chat between children or contact with strangers.</li>
          <li>No voice recordings stored: speech recognition runs in your child's browser; only an accuracy score is saved.</li>
          <li>Character voices and music are generated in your child's browser. If a neural voice service is enabled, only PING VIBE's own lines and learning content (words, stories) are sent to it to create audio — never your child's writing, name or answers. Sound preferences (volumes, on/off) are saved to your child's profile. Parents can switch music and voices off in Settings.</li>
          <li>No paid loot boxes or real-money purchases inside the child experience.</li>
        </ul></section>
        <section><h2 className="title-md text-white">AI feedback</h2><p className="mt-2">If you allow it, your child's writing and questions to LEXI are sent securely from our server to an AI provider (Anthropic's Claude) only to produce feedback. Messages to LEXI are not stored. You can switch the LEXI chat off anytime; writing then gets our built-in offline checker.</p></section>
        <section><h2 className="title-md text-white">Your rights (Digital Personal Data Protection Act, 2023)</h2><ul className="mt-2 list-disc space-y-1 pl-6">
          <li>Give, review or withdraw consent at any time from the parent dashboard.</li>
          <li>Download a full copy of your child's data (JSON export).</li>
          <li>Delete a child profile or your whole account instantly — data is erased permanently.</li>
          <li>Questions or grievances: contact the PING VIBE Grievance Officer at privacy@pingvibe.app.</li>
        </ul></section>
        <section><h2 className="title-md text-white">Security</h2><p className="mt-2">Passwords and PINs are hashed with scrypt; sessions use secure, http-only cookies; all AI and database keys stay on our servers; logins are rate-limited.</p></section>
      </div>
      <Link href="/signup" className="btn-primary mt-10">Back to sign-up</Link>
    </main>
  );
}
