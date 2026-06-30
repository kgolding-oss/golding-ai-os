# Executive Intelligence Engine

Milestone 9 adds a deterministic Executive Intelligence Engine under `lib/intelligence`. The engine synthesizes structured data already inside Golding AI OS and never calls OpenAI, embeddings, vector search, MCP, browser automation, or external APIs.

## Reasoning model

The authoritative model is deterministic. `executive-engine.ts` validates an `ExecutiveAnalysisContext`, delegates to analyzer modules, records telemetry, and stores the latest snapshot in the registry. Inputs include dashboard data, orchestration/workflow summaries, runtime telemetry, connector diagnostics, Knowledge OS health, diagnostics, platform health, and operating history.

## Deterministic analysis

The analyzer composes independent engines:

- `executive-score.ts` computes category and overall health.
- `recommendation-engine.ts` emits structured recommendations.
- `risk-engine.ts` ranks platform, runtime, connector, workflow, and persistence risks.
- `opportunity-engine.ts` identifies leverage from underused capabilities and knowledge gaps.
- `bottleneck-engine.ts` detects blocked work, retry pressure, and connector errors.
- `priority-engine.ts` ranks the strongest risks, bottlenecks, and recommendations.

## Scoring

The Executive Health Score contains Platform, Operations, Knowledge, Runtime, Connectors, Workflows, Organization Readiness, and AI Readiness categories. Each category includes score, confidence, explanation, and evidence. Overall score is the deterministic average of category scores.

## Recommendation generation

Recommendations include severity, confidence, subsystem, rationale, suggested action, expected impact, evidence, and status. Current rules cover missing workflow registrations, unhealthy connectors, unused runtime tools, diagnostics findings, missing knowledge corpus, limited organization coverage, runtime policy violations, and absent health history.

## Executive memory

`executive-memory.ts` builds deterministic memory from operating history and previous memory state. It tracks completed and dismissed recommendations, recurring issues, recurring successes, historical priorities, strategic trends, and operating patterns. There are no embeddings and no vector search.

## Risk, opportunity, and bottleneck models

Risks are ranked by production impact. Opportunities are leverage signals that suggest deterministic experiments. Bottlenecks identify constraints such as blocked tasks, connector telemetry errors, runtime retries, and workflow congestion.

## Persistence

`lib/persistence/executive-history.ts` provides an executive snapshot persistence hook using the shared repository architecture. The engine remains resilient if persistence tables are not yet available because repository writes already fail closed when a persistence context or token is unavailable.

## Dashboard integration

The dashboard builds an `ExecutiveAnalysisContext` from runtime, Knowledge OS, connectors, workflow engine, diagnostics, platform health, operating history, and dashboard records. The new Executive Intelligence section displays score, priorities, risks, opportunities, bottlenecks, trend summary, and timeline.

## Command Agent integration

The deterministic command registry now supports executive briefing, score, priorities, strategic risks, opportunities, bottlenecks, recommendations, timeline, importance explanation, and score explanation commands. Commands delegate to the Executive Intelligence Engine.

## Future LLM augmentation

A future LLM can plug in as a reasoning accelerator that summarizes or challenges deterministic outputs. It must not replace the engine as the source of truth. Structured evidence, scoring, policies, and persistence should remain authoritative.

## Future predictive analytics and autonomous planning

Future milestones can add time-series trend storage, predictive scoring, autonomous planning proposals, and approval-gated execution. These should use the deterministic snapshot format as the stable contract.
