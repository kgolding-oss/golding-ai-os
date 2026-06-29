import { PageShell } from "../../components/PageShell";
import { requireActiveOrganization } from "../../lib/activeOrganization";
import { getRows } from "../../lib/supabase/data";

type Row = Record<string, string | number | boolean | null>;

export default async function RbacPage() {
  const { session, activeOrganization, memberships } = await requireActiveOrganization();
  const rows = activeOrganization
    ? await getRows<Row>("user_roles", session.access_token, `?select=*&organization_id=eq.${encodeURIComponent(activeOrganization.id)}&order=created_at.desc`)
    : [];

  return (
    <PageShell title="RBAC" kicker="Roles and permission mappings" activeOrganization={activeOrganization} memberships={memberships}>
      {!activeOrganization ? <EmptyState /> : null}
      
      <section className="recordGrid">
        {rows.map((row) => (
          <article className="panel recordCard" key={String(row.id)}>
            <h2>{String(row.profile_id ?? "Untitled")}</h2>
            <p>{String(row.role_id ?? "No detail")}</p>
          </article>
        ))}
      </section>
    </PageShell>
  );
}

function EmptyState() {
  return <section className="panel"><p>No active organization is available for this account.</p></section>;
}
