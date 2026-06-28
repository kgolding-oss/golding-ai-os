import type { Business } from "@/lib/data/dashboard";

export function BusinessCard({ business }: { business: Business }) {
  return <article className="business-card"><div><h3>{business.name}</h3><span>{business.status}</span></div><p>{business.description ?? "Business operating lane ready for connected data."}</p><a href={`/businesses/${business.slug}`}>Open lane</a></article>;
}
