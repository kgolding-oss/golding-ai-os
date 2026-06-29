import Link from "next/link";
import { OrgSwitcher } from "../identity/OrgSwitcher";

const links = [
  ["Dashboard", "/dashboard"],
  ["Organizations", "/organizations"],
  ["People", "/people"],
  ["RBAC", "/rbac"],
  ["Invitations", "/invitations"],
  ["Profile", "/profile"],
  ["Agents", "/agents"],
  ["Tasks", "/tasks"],
  ["Approvals", "/approvals"],
  ["Health", "/system-health"],
];

export function Navigation() {
  return (
    <nav className="topNav panel" aria-label="Executive dashboard">
      <div><strong>Golding AI OS</strong><span>Secure multi-organization command center</span></div>
      <OrgSwitcher />
      <div className="navLinks">{links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</div>
    </nav>
  );
}
