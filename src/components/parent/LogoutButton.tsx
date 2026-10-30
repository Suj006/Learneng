"use client";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client";

export function LogoutButton({ to = "/login?as=parent" }: { to?: string }) {
  const router = useRouter();
  return <button className="btn-ghost btn-sm" onClick={async () => { await api("/api/auth/logout", { body: {} }).catch(() => {}); window.location.assign(to); }}>Log out</button>;
}
