export * from "./connector-types"; export * from "./connector-errors"; export * from "./connector-events"; export * from "./connector-validator"; export * from "./connector-health"; export * from "./connector-policy"; export * from "./connector-context"; export * from "./connector-security"; export * from "./connector-session"; export * from "./connector-registry"; export * from "./connector-runtime"; export * from "./connector-capabilities"; export * from "./connector-factory"; export * from "./connector-manager";
import { createMockConnector } from "./connector-factory"; import { connectorRegistry } from "./connector-registry"; import { githubConnector } from "./providers/github"; import { googleWorkspaceConnectors } from "./providers/google";
const mocks = [
  createMockConnector({ id: "supabase", name: "Supabase", provider: "Supabase", category: "database", description: "Mock Supabase connector metadata surface.", resources: ["projects", "tables", "edge_functions"] }),
  createMockConnector({ id: "vercel", name: "Vercel", provider: "Vercel", category: "deployment", description: "Mock Vercel connector metadata surface.", resources: ["projects", "deployments", "domains"] }),
  createMockConnector({ id: "browser", name: "Browser", provider: "Golding AI OS", category: "browser", description: "Mock browser automation connector metadata surface.", resources: ["pages", "sessions"] }),
  createMockConnector({ id: "openai", name: "OpenAI", provider: "OpenAI", category: "ai", description: "Mock OpenAI connector metadata surface.", resources: ["models", "responses", "files"] }),
  createMockConnector({ id: "mcp-server", name: "MCP Server", provider: "Model Context Protocol", category: "mcp", description: "Mock MCP server connector metadata surface.", resources: ["tools", "resources", "prompts"] })
];
if (!connectorRegistry.getConnector(githubConnector.id)) connectorRegistry.registerConnector(githubConnector);
for (const connector of googleWorkspaceConnectors) if (!connectorRegistry.getConnector(connector.id)) connectorRegistry.registerConnector(connector);
for (const connector of mocks) if (!connectorRegistry.getConnector(connector.id)) connectorRegistry.registerConnector(connector);
export * from "./providers/github"; export * from "./providers/google";
