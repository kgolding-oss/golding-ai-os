import type { ResearchSnapshot } from "./research-types";
export function research_mediaSnapshot(s: ResearchSnapshot) {
  const keyword = "media";
  return { area: "research-media", items: s.items.filter((item) => item.category === "media" || item.topic.toLowerCase().includes(keyword)), monitoring: s.monitoring.filter((m) => m.category === "media" || m.topic.toLowerCase().includes(keyword)), note: "Operational metadata for human review; no final conclusions." };
}
