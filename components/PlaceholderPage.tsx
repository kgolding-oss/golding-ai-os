import { ExecutiveCard } from "@/components/ExecutiveCard";
import { NavigationSidebar } from "@/components/NavigationSidebar";
import { TopNavigation } from "@/components/TopNavigation";
import { requireSession } from "@/lib/supabase/server";

export async function PlaceholderPage({ title, description }: { title: string; description: string }) {
  const session = await requireSession();
  return <main className="app-frame"><NavigationSidebar /><div className="workspace"><TopNavigation email={session.user.email} /><ExecutiveCard eyebrow="Golding OS" title={title}><p className="brief-text">{description}</p></ExecutiveCard></div></main>;
}
