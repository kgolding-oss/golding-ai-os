import type { ResearchSnapshot } from "./research-types";
export function research_legalSnapshot(s: ResearchSnapshot) {
  const keyword = "legal";
  return { area: "research-legal", items: s.items.filter((item) => item.category === "legal" || item.topic.toLowerCase().includes(keyword)), monitoring: s.monitoring.filter((m) => m.category === "legal" || m.topic.toLowerCase().includes(keyword)), note: "Operational metadata for human review; no final conclusions." };
}
