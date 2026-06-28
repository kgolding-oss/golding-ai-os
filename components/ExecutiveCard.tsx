import type { ReactNode } from "react";

export function ExecutiveCard({ eyebrow, title, children, actions }: { eyebrow?: string; title: string; children: ReactNode; actions?: ReactNode }) {
  return <section className="executive-card"><div className="card-heading">{eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}<h2>{title}</h2>{actions}</div>{children}</section>;
}
