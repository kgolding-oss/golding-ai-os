import Link from "next/link";
import { switchOrganization } from "../../app/actions/organization";
import type { ActiveOrganization, OrganizationMembership } from "../../lib/activeOrganization";

const links = [
  ["Dashboard", "/dashboard"],
  ["Organizations", "/organizations"],
  ["People", "/people"],
  ["Agents", "/agents"],
  ["Tasks", "/tasks"],
  ["Approvals", "/approvals"],
  ["Invitations", "/invitations"],
  ["RBAC", "/rbac"],
  ["Profile", "/profile"],
  ["Health", "/system-health"],
];

type NavigationProps = {
  activeOrganization?: ActiveOrganization | null;
  memberships?: OrganizationMembership[];
  returnTo?: string;
};

export function Navigation({ activeOrganization, memberships = [], returnTo = "/dashboard" }: NavigationProps) {
  return (
    <nav className="topNav panel" aria-label="Executive dashboard">
      <div>
        <strong>Golding AI OS</strong>
        <span>{activeOrganization?.name ?? "Select an active organization"}</span>
      </div>
      <form action={switchOrganization} className="organizationSwitcher">
        <input type="hidden" name="return_to" value={returnTo} />
        <label>
          <span className="srOnly">Active organization</span>
          <select name="organization_id" defaultValue={activeOrganization?.id ?? ""} aria-label="Active organization">
            <option value="" disabled>No active organization</option>
            {memberships.map((membership) => {
              const organization = membership.organizations;
              if (!organization) return null;
              return <option key={membership.organization_id} value={membership.organization_id}>{organization.name}</option>;
            })}
          </select>
        </label>
        <button className="button" type="submit">Switch</button>
      </form>
      <div className="navLinks">{links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</div>
    </nav>
  );
}
