import type { ConnectorCapability, ConnectorOperation, ConnectorPermission, ConnectorResource } from "../../../connector-types";
export const sheetsPermissions: ConnectorPermission[] = [
  {
    "id": "google-sheets:spreadsheets.list",
    "description": "Allows spreadsheets.list for Google Sheets.",
    "required": true
  },
  {
    "id": "google-sheets:spreadsheets.read",
    "description": "Allows spreadsheets.read for Google Sheets.",
    "required": true
  },
  {
    "id": "google-sheets:values.write",
    "description": "Allows values.write for Google Sheets.",
    "required": true
  },
  {
    "id": "google-sheets:values.append",
    "description": "Allows values.append for Google Sheets.",
    "required": true
  },
  {
    "id": "google-sheets:metadata.read",
    "description": "Allows metadata.read for Google Sheets.",
    "required": true
  },
  {
    "id": "google-sheets:tabs.list",
    "description": "Allows tabs.list for Google Sheets.",
    "required": true
  },
  {
    "id": "google-sheets:intelligence.summary",
    "description": "Allows intelligence.summary for Google Sheets.",
    "required": true
  }
];
export const sheetsResources: ConnectorResource[] = [
  {
    "id": "spreadsheets",
    "name": "spreadsheets",
    "description": "Google Sheets spreadsheets",
    "classification": "confidential"
  },
  {
    "id": "tabs",
    "name": "tabs",
    "description": "Google Sheets tabs",
    "classification": "confidential"
  },
  {
    "id": "values",
    "name": "values",
    "description": "Google Sheets values",
    "classification": "confidential"
  },
  {
    "id": "metadata",
    "name": "metadata",
    "description": "Google Sheets metadata",
    "classification": "confidential"
  }
] as ConnectorResource[];
export const sheetsOperations: ConnectorOperation[] = [
  {
    "id": "spreadsheets.list",
    "name": "spreadsheets.list",
    "description": "Google Sheets spreadsheets.list",
    "permission": "google-sheets:spreadsheets.list",
    "deterministic": true,
    "async": true
  },
  {
    "id": "spreadsheets.read",
    "name": "spreadsheets.read",
    "description": "Google Sheets spreadsheets.read",
    "permission": "google-sheets:spreadsheets.read",
    "deterministic": true,
    "async": true
  },
  {
    "id": "values.write",
    "name": "values.write",
    "description": "Google Sheets values.write",
    "permission": "google-sheets:values.write",
    "deterministic": false,
    "async": true
  },
  {
    "id": "values.append",
    "name": "values.append",
    "description": "Google Sheets values.append",
    "permission": "google-sheets:values.append",
    "deterministic": false,
    "async": true
  },
  {
    "id": "metadata.read",
    "name": "metadata.read",
    "description": "Google Sheets metadata.read",
    "permission": "google-sheets:metadata.read",
    "deterministic": true,
    "async": true
  },
  {
    "id": "tabs.list",
    "name": "tabs.list",
    "description": "Google Sheets tabs.list",
    "permission": "google-sheets:tabs.list",
    "deterministic": true,
    "async": true
  },
  {
    "id": "intelligence.summary",
    "name": "intelligence.summary",
    "description": "Google Sheets intelligence.summary",
    "permission": "google-sheets:intelligence.summary",
    "deterministic": true,
    "async": true
  }
];
export const sheetsCapabilities: ConnectorCapability[] = [{ id: 'google-sheets.workspace', name: 'Google Sheets Workspace Platform', description: 'Runtime-routed Google Workspace operations with deterministic intelligence and approval gates.', deterministic: false, resources: ["spreadsheets","tabs","values","metadata"], operations: ["spreadsheets.list","spreadsheets.read","values.write","values.append","metadata.read","tabs.list","intelligence.summary"] }];
