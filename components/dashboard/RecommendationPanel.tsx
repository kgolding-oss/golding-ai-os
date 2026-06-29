import type { Recommendation } from "../../lib/dashboard/intelligence";
import { Widget } from "./Widget";

export function RecommendationPanel({ recommendations }: { recommendations: Recommendation[] }) {
  return (
    <Widget eyebrow="Recommendations" title="Live operating guidance">
      <div className="list">
        {recommendations.length ? recommendations.map((recommendation) => (
          <div className="recommendation" key={recommendation.id}>
            <span className={`pill ${recommendation.severity}`}>{recommendation.severity}</span>
            <h3>{recommendation.title}</h3>
            <p>{recommendation.rationale}</p>
            <strong>{recommendation.action}</strong>
          </div>
        )) : <p className="emptyState">No recommendations are needed from current live records. Add tasks, approvals, agents, projects, and integrations to expand command intelligence.</p>}
      </div>
    </Widget>
  );
}
