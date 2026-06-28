import type { Approval } from "@/lib/data/dashboard";

export function ApprovalCard({ approval }: { approval: Approval }) {
  return <article className="approval-card"><div><strong>{approval.title}</strong><span>{approval.requested_by ?? "Executive workflow"}</span></div><em>{approval.priority}</em></article>;
}
