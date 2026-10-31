import { AdminLogin } from "@/components/admin/AdminForms";
import { PingVibeLogo } from "@/components/PingVibeLogo";
export const metadata = { title: "Admin login" };
export default function Page() {
  return <main id="main" className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-4"><span className="w-fit rounded-3xl bg-white p-2"><PingVibeLogo width={220} /></span><h1 className="title-lg">Administrator</h1><AdminLogin /></main>;
}
