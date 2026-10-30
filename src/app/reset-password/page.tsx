import { Suspense } from "react";
import { AuthShell } from "@/components/forms/AuthShell";
import { ResetForm } from "@/components/forms/ResetForms";
export const metadata = { title: "Reset password" };
export default function Page() { return <AuthShell><Suspense><ResetForm /></Suspense></AuthShell>; }
