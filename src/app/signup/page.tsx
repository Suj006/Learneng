import { AuthShell } from "@/components/forms/AuthShell";
import { SignupForm } from "@/components/forms/SignupForm";
import { CharacterSays } from "@/components/ui";
import { activeGrades } from "@/server/accounts";

export const metadata = { title: "Start your adventure" };
export const dynamic = "force-dynamic";

export default async function SignupPage() {
  const grades = await activeGrades();
  return (
    <AuthShell aside={<CharacterSays who="max" mood="excited" size={150}>A new Explorer? Yay! Ask a grown-up to help you sign up. It only takes a minute!</CharacterSays>}>
      <SignupForm grades={grades} />
    </AuthShell>
  );
}
