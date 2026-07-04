# Model Router

`aiIntegrationHub.route()` accepts a capability request such as `coding`, `fresh_research`, `internal_document_search`, `github_operation`, or `email_operation`. Routing considers capability match, health, credentials, estimated cost tier, latency, disabled-provider policy, max-cost policy, approval sensitivity, and fallback availability.

The structured result includes the selected provider or connector, fallback provider or connector, approval requirement, cost tier, health, candidates, and a human-readable reason. The router never hardcodes a single vendor as the only path.

Default examples: coding prefers configured model providers; fresh research can use Perplexity or browser fallback; internal document search can use Knowledge OS, Drive, or filesystem vault placeholders; GitHub/database/email/calendar tasks route through connector-compatible candidates.
