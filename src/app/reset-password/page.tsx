import { AuthShell } from "@/components/forms/AuthShell";
import { ResetForm } from "@/components/forms/ResetForms";
export const metadata = { title: "Reset password" };
export default async function Page({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  return <AuthShell><ResetForm token={token} /></AuthShell>;
}
