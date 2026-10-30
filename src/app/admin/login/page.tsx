import { AdminLogin } from "@/components/admin/AdminForms";
import { Logo } from "@/components/Logo";
export const metadata = { title: "Admin login" };
export default function Page() {
  return <main id="main" className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-4"><Logo /><h1 className="title-lg">Administrator</h1><AdminLogin /></main>;
}
