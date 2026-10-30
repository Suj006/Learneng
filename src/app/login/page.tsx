import { AuthShell } from "@/components/forms/AuthShell";
import { LoginForm } from "@/components/forms/LoginForm";
import { CharacterSays } from "@/components/ui";

export const metadata = { title: "Login" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ as?: string }> }) {
  const { as } = await searchParams;
  return (
    <AuthShell aside={<CharacterSays who="max" mood="welcome" size={150}>Hey Explorer! Your next mission is waiting!</CharacterSays>}>
      <LoginForm initialTab={as === "parent" ? "parent" : "child"} />
    </AuthShell>
  );
}
