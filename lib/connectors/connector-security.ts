import type { ConnectorDefinition } from "./connector-types";
const order = ["public", "internal", "confidential", "restricted"];
export function isSecurityClassificationAllowed(connector: ConnectorDefinition, max = "restricted") { return order.indexOf(connector.securityClassification) <= order.indexOf(max); }
