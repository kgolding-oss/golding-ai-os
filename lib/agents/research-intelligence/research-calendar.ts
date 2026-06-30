import type { ResearchSnapshot } from "./research-types";
export function research_calendarSnapshot(s: ResearchSnapshot) {
  const keyword = "calendar";
  return { area: "research-calendar", items: s.items.filter((item) => item.category === "operations" || item.topic.toLowerCase().includes(keyword)), monitoring: s.monitoring.filter((m) => m.category === "operations" || m.topic.toLowerCase().includes(keyword)), note: "Operational metadata for human review; no final conclusions." };
}
