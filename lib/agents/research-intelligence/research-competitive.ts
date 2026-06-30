import type { ResearchSnapshot } from "./research-types";
export function research_competitiveSnapshot(s: ResearchSnapshot) {
  const keyword = "competitive";
  return { area: "research-competitive", items: s.items.filter((item) => item.category === "competitors" || item.topic.toLowerCase().includes(keyword)), monitoring: s.monitoring.filter((m) => m.category === "competitors" || m.topic.toLowerCase().includes(keyword)), note: "Operational metadata for human review; no final conclusions." };
}
