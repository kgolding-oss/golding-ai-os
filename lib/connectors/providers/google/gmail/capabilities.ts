import type { ConnectorCapability, ConnectorOperation, ConnectorPermission, ConnectorResource } from "../../../connector-types";
export const gmailPermissions: ConnectorPermission[] = [
  {
    "id": "gmail:inbox.read",
    "description": "Allows inbox.read for Gmail.",
    "required": true
  },
  {
    "id": "gmail:labels.list",
    "description": "Allows labels.list for Gmail.",
    "required": true
  },
  {
    "id": "gmail:messages.unread",
    "description": "Allows messages.unread for Gmail.",
    "required": true
  },
  {
    "id": "gmail:messages.starred",
    "description": "Allows messages.starred for Gmail.",
    "required": true
  },
  {
    "id": "gmail:drafts.list",
    "description": "Allows drafts.list for Gmail.",
    "required": true
  },
  {
    "id": "gmail:threads.search",
    "description": "Allows threads.search for Gmail.",
    "required": true
  },
  {
    "id": "gmail:drafts.create",
    "description": "Allows drafts.create for Gmail.",
    "required": true
  },
  {
    "id": "gmail:messages.send",
    "description": "Allows messages.send for Gmail.",
    "required": true
  },
  {
    "id": "gmail:messages.reply",
    "description": "Allows messages.reply for Gmail.",
    "required": true
  },
  {
    "id": "gmail:messages.archive",
    "description": "Allows messages.archive for Gmail.",
    "required": true
  },
  {
    "id": "gmail:messages.label",
    "description": "Allows messages.label for Gmail.",
    "required": true
  },
  {
    "id": "gmail:messages.trash",
    "description": "Allows messages.trash for Gmail.",
    "required": true
  },
  {
    "id": "gmail:intelligence.summary",
    "description": "Allows intelligence.summary for Gmail.",
    "required": true
  }
];
export const gmailResources: ConnectorResource[] = [
  {
    "id": "inbox",
    "name": "inbox",
    "description": "Gmail inbox",
    "classification": "confidential"
  },
  {
    "id": "labels",
    "name": "labels",
    "description": "Gmail labels",
    "classification": "confidential"
  },
  {
    "id": "messages",
    "name": "messages",
    "description": "Gmail messages",
    "classification": "confidential"
  },
  {
    "id": "threads",
    "name": "threads",
    "description": "Gmail threads",
    "classification": "confidential"
  },
  {
    "id": "drafts",
    "name": "drafts",
    "description": "Gmail drafts",
    "classification": "confidential"
  }
] as ConnectorResource[];
export const gmailOperations: ConnectorOperation[] = [
  {
    "id": "inbox.read",
    "name": "inbox.read",
    "description": "Gmail inbox.read",
    "permission": "gmail:inbox.read",
    "deterministic": true,
    "async": true
  },
  {
    "id": "labels.list",
    "name": "labels.list",
    "description": "Gmail labels.list",
    "permission": "gmail:labels.list",
    "deterministic": true,
    "async": true
  },
  {
    "id": "messages.unread",
    "name": "messages.unread",
    "description": "Gmail messages.unread",
    "permission": "gmail:messages.unread",
    "deterministic": true,
    "async": true
  },
  {
    "id": "messages.starred",
    "name": "messages.starred",
    "description": "Gmail messages.starred",
    "permission": "gmail:messages.starred",
    "deterministic": true,
    "async": true
  },
  {
    "id": "drafts.list",
    "name": "drafts.list",
    "description": "Gmail drafts.list",
    "permission": "gmail:drafts.list",
    "deterministic": true,
    "async": true
  },
  {
    "id": "threads.search",
    "name": "threads.search",
    "description": "Gmail threads.search",
    "permission": "gmail:threads.search",
    "deterministic": true,
    "async": true
  },
  {
    "id": "drafts.create",
    "name": "drafts.create",
    "description": "Gmail drafts.create",
    "permission": "gmail:drafts.create",
    "deterministic": true,
    "async": true
  },
  {
    "id": "messages.send",
    "name": "messages.send",
    "description": "Gmail messages.send",
    "permission": "gmail:messages.send",
    "deterministic": false,
    "async": true
  },
  {
    "id": "messages.reply",
    "name": "messages.reply",
    "description": "Gmail messages.reply",
    "permission": "gmail:messages.reply",
    "deterministic": false,
    "async": true
  },
  {
    "id": "messages.archive",
    "name": "messages.archive",
    "description": "Gmail messages.archive",
    "permission": "gmail:messages.archive",
    "deterministic": true,
    "async": true
  },
  {
    "id": "messages.label",
    "name": "messages.label",
    "description": "Gmail messages.label",
    "permission": "gmail:messages.label",
    "deterministic": true,
    "async": true
  },
  {
    "id": "messages.trash",
    "name": "messages.trash",
    "description": "Gmail messages.trash",
    "permission": "gmail:messages.trash",
    "deterministic": true,
    "async": true
  },
  {
    "id": "intelligence.summary",
    "name": "intelligence.summary",
    "description": "Gmail intelligence.summary",
    "permission": "gmail:intelligence.summary",
    "deterministic": true,
    "async": true
  }
];
export const gmailCapabilities: ConnectorCapability[] = [{ id: 'gmail.workspace', name: 'Gmail Workspace Platform', description: 'Runtime-routed Google Workspace operations with deterministic intelligence and approval gates.', deterministic: false, resources: ["inbox","labels","messages","threads","drafts"], operations: ["inbox.read","labels.list","messages.unread","messages.starred","drafts.list","threads.search","drafts.create","messages.send","messages.reply","messages.archive","messages.label","messages.trash","intelligence.summary"] }];
