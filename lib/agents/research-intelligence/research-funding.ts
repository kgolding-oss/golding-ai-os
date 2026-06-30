import type { ResearchSnapshot } from "./research-types";
export function research_fundingSnapshot(s: ResearchSnapshot) {
  const keyword = "funding";
  return { area: "research-funding", items: s.items.filter((item) => item.category === "funders" || item.topic.toLowerCase().includes(keyword)), monitoring: s.monitoring.filter((m) => m.category === "funders" || m.topic.toLowerCase().includes(keyword)), note: "Operational metadata for human review; no final conclusions." };
}
