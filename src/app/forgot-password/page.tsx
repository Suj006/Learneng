import { AuthShell } from "@/components/forms/AuthShell";
import { ForgotForm } from "@/components/forms/ResetForms";
export const metadata = { title: "Forgot password" };
export default function Page() { return <AuthShell><ForgotForm /></AuthShell>; }
