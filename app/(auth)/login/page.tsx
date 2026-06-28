import { redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { getSession } from "@/lib/supabase/server";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");
  return <main className="login-page"><section className="login-panel"><p className="eyebrow">Golding AI Operating System</p><h1>Secure executive login</h1><p>Sign in with your existing Supabase user account. Session cookies are stored server-side and no service role key is used.</p><LoginForm /></section></main>;
}
