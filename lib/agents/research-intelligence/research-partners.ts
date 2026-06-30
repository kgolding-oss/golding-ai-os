import type { ResearchSnapshot } from "./research-types";
export function research_partnersSnapshot(s: ResearchSnapshot) {
  const keyword = "partners";
  return { area: "research-partners", items: s.items.filter((item) => item.category === "partners" || item.topic.toLowerCase().includes(keyword)), monitoring: s.monitoring.filter((m) => m.category === "partners" || m.topic.toLowerCase().includes(keyword)), note: "Operational metadata for human review; no final conclusions." };
}
