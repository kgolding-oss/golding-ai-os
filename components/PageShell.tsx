import type { ReactNode } from "react";
import { currentPath, type ActiveOrganization, type OrganizationMembership } from "../lib/activeOrganization";
import { Navigation } from "./dashboard/Navigation";

type PageShellProps = {
  title: string;
  kicker: string;
  activeOrganization?: ActiveOrganization | null;
  memberships?: OrganizationMembership[];
  children: ReactNode;
};

export function PageShell({ title, kicker, activeOrganization, memberships = [], children }: PageShellProps) {
  return (
    <main className="shell">
      <Navigation activeOrganization={activeOrganization} memberships={memberships} returnTo={currentPath()} />
      <section className="pageHeader panel">
        <p className="eyebrow">{kicker}</p>
        <h1>{title}</h1>
      </section>
      {children}
    </main>
  );
}
