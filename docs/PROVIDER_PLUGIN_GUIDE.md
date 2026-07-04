# Provider Plugin Guide

Provider, connector, and routing-pack plugins should register with the AI Integration Hub instead of editing Executive Command.

1. Export a plugin manifest using the Milestone 17 plugin system.
2. Declare external APIs, required credentials, approval requirements, and audit events.
3. On plugin load, call `aiIntegrationHub.registerProvider()` or `aiIntegrationHub.registerConnector()` with capabilities, health, cost profile, context window, modality flags, and fallback ids.
4. Keep execution behind existing runtime/connector approval gates.
5. Return deterministic `not_configured` or degraded health when credentials or dependencies are absent.

This keeps future providers such as Perplexity, OpenAI, MCP servers, local models, Anthropic, Gemini, and organization-specific tools interchangeable.
