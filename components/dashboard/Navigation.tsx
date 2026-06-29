import Link from "next/link";

const links = [
  ["Dashboard", "/dashboard"],
  ["Organizations", "/organizations"],
  ["Agents", "/agents"],
  ["Tasks", "/tasks"],
  ["Approvals", "/approvals"],
  ["People", "/people"],
  ["Invitations", "/invitations"],
  ["Health", "/system-health"],
];

export function Navigation() {
  return (
    <nav className="topNav panel" aria-label="Executive dashboard">
      <div><strong>Golding AI OS</strong><span>Executive command center</span></div>
      <div className="navLinks">{links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</div>
    </nav>
  );
}
