import type { ResearchSnapshot } from "./research-types";
export function research_reportsSnapshot(s: ResearchSnapshot) {
  const keyword = "reports";
  return { area: "research-reports", items: s.items.filter((item) => item.category === "operations" || item.topic.toLowerCase().includes(keyword)), monitoring: s.monitoring.filter((m) => m.category === "operations" || m.topic.toLowerCase().includes(keyword)), note: "Operational metadata for human review; no final conclusions." };
}
