import { createServerSideClient } from "@/lib/server-utils";
import { redirect } from "next/navigation";

const ADMIN_EMAILS = ["ersozberk@gmail.com"];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerSideClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !ADMIN_EMAILS.includes(user.email!)) {
    redirect("/"); // Admin değilse anasayfaya at
  }

  return <div className="p-8">{children}</div>;
}
