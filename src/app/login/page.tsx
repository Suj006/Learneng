import { Suspense } from "react";
import { AuthShell } from "@/components/forms/AuthShell";
import { LoginForm } from "@/components/forms/LoginForm";
import { CharacterSays } from "@/components/ui";

export const metadata = { title: "Login" };

export default function LoginPage() {
  return (
    <AuthShell aside={<CharacterSays who="max" mood="welcome" size={150}>Hey Explorer! Your next mission is waiting!</CharacterSays>}>
      <Suspense><LoginForm /></Suspense>
    </AuthShell>
  );
}
