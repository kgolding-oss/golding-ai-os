import { summarizeConnectorCapabilities } from "./connector-capabilities";
import { connectorRegistry } from "./connector-registry";
import { connectorRuntime } from "./connector-runtime";
import { connectorTelemetry } from "./connector-telemetry";
export const connectorManager = { registry: connectorRegistry, runtime: connectorRuntime, list: () => connectorRegistry.listConnectors(), health: () => connectorRegistry.listConnectors().map((connector) => ({ connectorId: connector.id, name: connector.name, health: connector.health })), capabilities: () => connectorRegistry.listConnectors().map(summarizeConnectorCapabilities), diagnostics: () => ({ telemetry: connectorTelemetry(), connectors: connectorRegistry.listConnectors().map((connector) => ({ id: connector.id, diagnostics: connector.health.diagnostics, warnings: connector.health.warnings })) }) };
