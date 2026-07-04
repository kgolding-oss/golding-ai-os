# AI Integration Hub

Milestone 18 adds `lib/ai/integration-hub.ts` and the default registration in `lib/ai/default-integration-hub.ts`. Executive Command should request capabilities rather than vendors. The hub registers OpenAI, Perplexity, Anthropic placeholder, Google Gemini placeholder, local models placeholder, Knowledge OS, and MCP tools with health, costs, credentials, modality support, tool-calling support, context windows, fallback providers, and plugin readiness.

The dashboard panel shows available/configured/degraded providers, connector health, fallback paths, capability routing, approval-sensitive capabilities, and dashboard-ready cost summaries.

Provider absence is safe: missing environment variables mark entries `not_configured`, and routing either selects another healthy configured candidate or returns a deterministic no-provider result.
