import type { ConnectorCapability, ConnectorOperation, ConnectorPermission, ConnectorResource } from "../../../connector-types";
export const drivePermissions: ConnectorPermission[] = [
  {
    "id": "google-drive:folders.list",
    "description": "Allows folders.list for Google Drive.",
    "required": true
  },
  {
    "id": "google-drive:files.list",
    "description": "Allows files.list for Google Drive.",
    "required": true
  },
  {
    "id": "google-drive:files.search",
    "description": "Allows files.search for Google Drive.",
    "required": true
  },
  {
    "id": "google-drive:files.upload",
    "description": "Allows files.upload for Google Drive.",
    "required": true
  },
  {
    "id": "google-drive:files.download",
    "description": "Allows files.download for Google Drive.",
    "required": true
  },
  {
    "id": "google-drive:files.metadata",
    "description": "Allows files.metadata for Google Drive.",
    "required": true
  },
  {
    "id": "google-drive:sharing.update",
    "description": "Allows sharing.update for Google Drive.",
    "required": true
  },
  {
    "id": "google-drive:intelligence.summary",
    "description": "Allows intelligence.summary for Google Drive.",
    "required": true
  },
  {
    "id": "google-drive:knowledge.register",
    "description": "Allows knowledge.register for Google Drive.",
    "required": true
  }
];
export const driveResources: ConnectorResource[] = [
  {
    "id": "folders",
    "name": "folders",
    "description": "Google Drive folders",
    "classification": "confidential"
  },
  {
    "id": "files",
    "name": "files",
    "description": "Google Drive files",
    "classification": "confidential"
  },
  {
    "id": "search",
    "name": "search",
    "description": "Google Drive search",
    "classification": "confidential"
  },
  {
    "id": "metadata",
    "name": "metadata",
    "description": "Google Drive metadata",
    "classification": "confidential"
  },
  {
    "id": "sharing",
    "name": "sharing",
    "description": "Google Drive sharing",
    "classification": "confidential"
  },
  {
    "id": "storage",
    "name": "storage",
    "description": "Google Drive storage",
    "classification": "confidential"
  }
] as ConnectorResource[];
export const driveOperations: ConnectorOperation[] = [
  {
    "id": "folders.list",
    "name": "folders.list",
    "description": "Google Drive folders.list",
    "permission": "google-drive:folders.list",
    "deterministic": true,
    "async": true
  },
  {
    "id": "files.list",
    "name": "files.list",
    "description": "Google Drive files.list",
    "permission": "google-drive:files.list",
    "deterministic": true,
    "async": true
  },
  {
    "id": "files.search",
    "name": "files.search",
    "description": "Google Drive files.search",
    "permission": "google-drive:files.search",
    "deterministic": true,
    "async": true
  },
  {
    "id": "files.upload",
    "name": "files.upload",
    "description": "Google Drive files.upload",
    "permission": "google-drive:files.upload",
    "deterministic": false,
    "async": true
  },
  {
    "id": "files.download",
    "name": "files.download",
    "description": "Google Drive files.download",
    "permission": "google-drive:files.download",
    "deterministic": true,
    "async": true
  },
  {
    "id": "files.metadata",
    "name": "files.metadata",
    "description": "Google Drive files.metadata",
    "permission": "google-drive:files.metadata",
    "deterministic": true,
    "async": true
  },
  {
    "id": "sharing.update",
    "name": "sharing.update",
    "description": "Google Drive sharing.update",
    "permission": "google-drive:sharing.update",
    "deterministic": false,
    "async": true
  },
  {
    "id": "intelligence.summary",
    "name": "intelligence.summary",
    "description": "Google Drive intelligence.summary",
    "permission": "google-drive:intelligence.summary",
    "deterministic": true,
    "async": true
  },
  {
    "id": "knowledge.register",
    "name": "knowledge.register",
    "description": "Google Drive knowledge.register",
    "permission": "google-drive:knowledge.register",
    "deterministic": true,
    "async": true
  }
];
export const driveCapabilities: ConnectorCapability[] = [{ id: 'google-drive.workspace', name: 'Google Drive Workspace Platform', description: 'Runtime-routed Google Workspace operations with deterministic intelligence and approval gates.', deterministic: false, resources: ["folders","files","search","metadata","sharing","storage"], operations: ["folders.list","files.list","files.search","files.upload","files.download","files.metadata","sharing.update","intelligence.summary","knowledge.register"] }];
