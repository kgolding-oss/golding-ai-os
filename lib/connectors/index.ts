export * from "./connector-types"; export * from "./connector-errors"; export * from "./connector-events"; export * from "./connector-validator"; export * from "./connector-health"; export * from "./connector-policy"; export * from "./connector-context"; export * from "./connector-security"; export * from "./connector-session"; export * from "./connector-registry"; export * from "./connector-runtime"; export * from "./connector-capabilities"; export * from "./connector-factory"; export * from "./connector-manager";
import { createMockConnector } from "./connector-factory"; import { connectorRegistry } from "./connector-registry"; import { githubConnector } from "./providers/github"; import { supabaseConnector } from "./providers/supabase";
const mocks = [
  createMockConnector({ id: "gmail", name: "Gmail", provider: "Google", category: "communication", description: "Mock Gmail connector metadata surface.", resources: ["messages", "labels", "threads"] }),
  createMockConnector({ id: "google-drive", name: "Google Drive", provider: "Google", category: "storage", description: "Mock Drive connector metadata surface.", resources: ["files", "folders", "permissions"] }),
  createMockConnector({ id: "google-calendar", name: "Google Calendar", provider: "Google", category: "calendar", description: "Mock Calendar connector metadata surface.", resources: ["calendars", "events"] }),
  createMockConnector({ id: "vercel", name: "Vercel", provider: "Vercel", category: "deployment", description: "Mock Vercel connector metadata surface.", resources: ["projects", "deployments", "domains"] }),
  createMockConnector({ id: "browser", name: "Browser", provider: "Golding AI OS", category: "browser", description: "Mock browser automation connector metadata surface.", resources: ["pages", "sessions"] }),
  createMockConnector({ id: "openai", name: "OpenAI", provider: "OpenAI", category: "ai", description: "Mock OpenAI connector metadata surface.", resources: ["models", "responses", "files"] }),
  createMockConnector({ id: "mcp-server", name: "MCP Server", provider: "Model Context Protocol", category: "mcp", description: "Mock MCP server connector metadata surface.", resources: ["tools", "resources", "prompts"] })
];
if (!connectorRegistry.getConnector(githubConnector.id)) connectorRegistry.registerConnector(githubConnector);
if (!connectorRegistry.getConnector(supabaseConnector.id)) connectorRegistry.registerConnector(supabaseConnector);
for (const connector of mocks) if (!connectorRegistry.getConnector(connector.id)) connectorRegistry.registerConnector(connector);
export * from "./providers/github"; export * from "./providers/supabase";
