import Link from "next/link";
import { headers } from "next/headers";
import { switchOrganization } from "../../app/actions/organization";
import type { ActiveOrganization, UserOrganization } from "../../lib/activeOrganization";

const links = [
  ["Dashboard", "/dashboard"],
  ["Organizations", "/organizations"],
  ["Agents", "/agents"],
  ["Tasks", "/tasks"],
  ["Approvals", "/approvals"],
  ["Health", "/system-health"],
];

export function Navigation({
  activeOrganization,
  memberships,
}: {
  activeOrganization?: ActiveOrganization | null;
  memberships?: UserOrganization[];
}) {
  const currentPath = headers().get("x-current-path") ?? "/dashboard";

  return (
    <nav className="topNav panel" aria-label="Executive dashboard">
      <div><strong>Golding AI OS</strong><span>Executive command center</span></div>
      <div className="navLinks">{links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</div>
      <form action={switchOrganization} className="organizationSwitcher">
        <input type="hidden" name="return_to" value={currentPath} />
        <label>
          <span>Active organization</span>
          <select name="organization_id" defaultValue={activeOrganization?.id ?? ""} aria-label="Active organization">
            {(memberships ?? []).map((membership) => membership.organization ? (
              <option key={membership.organization.id} value={membership.organization.id}>
                {membership.organization.name}{membership.organization.id === activeOrganization?.id ? " ✓" : ""}
              </option>
            ) : null)}
          </select>
        </label>
        <button className="button secondary" type="submit">Switch</button>
      </form>
    </nav>
  );
}
