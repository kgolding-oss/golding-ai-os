import { Navigation } from "./dashboard/Navigation";

export type ShellOrganization = {
  id: string;
  name: string;
};

export function PageShell({
  children,
  organizations = [],
}: {
  children: React.ReactNode;
  organizations?: ShellOrganization[];
}) {
  return (
    <main className="shell">
      <Navigation organizations={organizations} />
      {children}
    </main>
  );
}

export function PageHeader({ title, kicker, description }: { title: string; kicker: string; description: string }) {
  return (
    <section className="pageHeader panel">
      <p className="eyebrow">{kicker}</p>
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  );
}

export function EmptyState({ title, message }: { title: string; message: string }) {
  return (
    <section className="panel emptyState spacious">
      <h2>{title}</h2>
      <p>{message}</p>
    </section>
  );
}
