import Link from "next/link";

type OrganizationOption = {
  id: string;
  name: string;
};

const links = [
  ["Dashboard", "/dashboard"],
  ["Organizations", "/organizations"],
  ["People", "/people"],
  ["AI Agents", "/agents"],
  ["Tasks", "/tasks"],
  ["Approvals", "/approvals"],
  ["System Health", "/system-health"],
  ["Profile", "/profile"],
  ["RBAC", "/rbac"],
  ["Invitations", "/invitations"],
];

export function Navigation({ organizations = [] }: { organizations?: OrganizationOption[] }) {
  return (
    <nav className="topNav panel" aria-label="Executive dashboard">
      <div>
        <strong>Golding AI OS</strong>
        <span>Executive command center</span>
      </div>
      <label className="orgSwitcher">
        Organization Switcher
        <select defaultValue="">
          <option value="">Select organization</option>
          {organizations.map((organization) => (
            <option key={organization.id} value={organization.id}>
              {organization.name}
            </option>
          ))}
        </select>
      </label>
      <div className="navLinks">
        {links.map(([label, href]) => (
          <Link key={href} href={href}>
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
