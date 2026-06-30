import type { ConnectorCapability, ConnectorOperation, ConnectorPermission, ConnectorResource } from "../../../connector-types";
export const docsPermissions: ConnectorPermission[] = [
  {
    "id": "google-docs:documents.list",
    "description": "Allows documents.list for Google Docs.",
    "required": true
  },
  {
    "id": "google-docs:documents.read",
    "description": "Allows documents.read for Google Docs.",
    "required": true
  },
  {
    "id": "google-docs:documents.create",
    "description": "Allows documents.create for Google Docs.",
    "required": true
  },
  {
    "id": "google-docs:documents.update",
    "description": "Allows documents.update for Google Docs.",
    "required": true
  },
  {
    "id": "google-docs:comments.list",
    "description": "Allows comments.list for Google Docs.",
    "required": true
  },
  {
    "id": "google-docs:suggestions.list",
    "description": "Allows suggestions.list for Google Docs.",
    "required": true
  },
  {
    "id": "google-docs:documents.delete",
    "description": "Allows documents.delete for Google Docs.",
    "required": true
  },
  {
    "id": "google-docs:documents.replace",
    "description": "Allows documents.replace for Google Docs.",
    "required": true
  },
  {
    "id": "google-docs:knowledge.register",
    "description": "Allows knowledge.register for Google Docs.",
    "required": true
  }
];
export const docsResources: ConnectorResource[] = [
  {
    "id": "documents",
    "name": "documents",
    "description": "Google Docs documents",
    "classification": "confidential"
  },
  {
    "id": "comments",
    "name": "comments",
    "description": "Google Docs comments",
    "classification": "confidential"
  },
  {
    "id": "suggestions",
    "name": "suggestions",
    "description": "Google Docs suggestions",
    "classification": "confidential"
  }
] as ConnectorResource[];
export const docsOperations: ConnectorOperation[] = [
  {
    "id": "documents.list",
    "name": "documents.list",
    "description": "Google Docs documents.list",
    "permission": "google-docs:documents.list",
    "deterministic": true,
    "async": true
  },
  {
    "id": "documents.read",
    "name": "documents.read",
    "description": "Google Docs documents.read",
    "permission": "google-docs:documents.read",
    "deterministic": true,
    "async": true
  },
  {
    "id": "documents.create",
    "name": "documents.create",
    "description": "Google Docs documents.create",
    "permission": "google-docs:documents.create",
    "deterministic": true,
    "async": true
  },
  {
    "id": "documents.update",
    "name": "documents.update",
    "description": "Google Docs documents.update",
    "permission": "google-docs:documents.update",
    "deterministic": true,
    "async": true
  },
  {
    "id": "comments.list",
    "name": "comments.list",
    "description": "Google Docs comments.list",
    "permission": "google-docs:comments.list",
    "deterministic": true,
    "async": true
  },
  {
    "id": "suggestions.list",
    "name": "suggestions.list",
    "description": "Google Docs suggestions.list",
    "permission": "google-docs:suggestions.list",
    "deterministic": true,
    "async": true
  },
  {
    "id": "documents.delete",
    "name": "documents.delete",
    "description": "Google Docs documents.delete",
    "permission": "google-docs:documents.delete",
    "deterministic": false,
    "async": true
  },
  {
    "id": "documents.replace",
    "name": "documents.replace",
    "description": "Google Docs documents.replace",
    "permission": "google-docs:documents.replace",
    "deterministic": false,
    "async": true
  },
  {
    "id": "knowledge.register",
    "name": "knowledge.register",
    "description": "Google Docs knowledge.register",
    "permission": "google-docs:knowledge.register",
    "deterministic": true,
    "async": true
  }
];
export const docsCapabilities: ConnectorCapability[] = [{ id: 'google-docs.workspace', name: 'Google Docs Workspace Platform', description: 'Runtime-routed Google Workspace operations with deterministic intelligence and approval gates.', deterministic: false, resources: ["documents","comments","suggestions"], operations: ["documents.list","documents.read","documents.create","documents.update","comments.list","suggestions.list","documents.delete","documents.replace","knowledge.register"] }];
