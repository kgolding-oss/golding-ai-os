import { PageShell } from "../../components/PageShell";
import { requireActiveOrganization } from "../../lib/activeOrganization";
import { getRows } from "../../lib/supabase/data";

type Row = Record<string, string | number | boolean | null>;

export default async function ProfilePage() {
  const { session, activeOrganization, memberships } = await requireActiveOrganization();
  const rows = activeOrganization
    ? await getRows<Row>("user_preferences", session.access_token, `?select=*&active_organization_id=eq.${encodeURIComponent(activeOrganization.id)}`)
    : [];

  return (
    <PageShell title="Profile" kicker="Your preference context" activeOrganization={activeOrganization} memberships={memberships}>
      {!activeOrganization ? <EmptyState /> : null}
      
      <section className="recordGrid">
        {rows.map((row) => (
          <article className="panel recordCard" key={String(row.id)}>
            <h2>{String(row.profile_id ?? "Untitled")}</h2>
            <p>{String(row.active_organization_id ?? "No detail")}</p>
          </article>
        ))}
      </section>
    </PageShell>
  );
}

function EmptyState() {
  return <section className="panel"><p>No active organization is available for this account.</p></section>;
}
