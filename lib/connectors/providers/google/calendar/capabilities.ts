import type { ConnectorCapability, ConnectorOperation, ConnectorPermission, ConnectorResource } from "../../../connector-types";
export const calendarPermissions: ConnectorPermission[] = [
  {
    "id": "google-calendar:calendars.list",
    "description": "Allows calendars.list for Google Calendar.",
    "required": true
  },
  {
    "id": "google-calendar:events.list",
    "description": "Allows events.list for Google Calendar.",
    "required": true
  },
  {
    "id": "google-calendar:availability.read",
    "description": "Allows availability.read for Google Calendar.",
    "required": true
  },
  {
    "id": "google-calendar:invitations.list",
    "description": "Allows invitations.list for Google Calendar.",
    "required": true
  },
  {
    "id": "google-calendar:reminders.list",
    "description": "Allows reminders.list for Google Calendar.",
    "required": true
  },
  {
    "id": "google-calendar:events.create",
    "description": "Allows events.create for Google Calendar.",
    "required": true
  },
  {
    "id": "google-calendar:events.update",
    "description": "Allows events.update for Google Calendar.",
    "required": true
  },
  {
    "id": "google-calendar:intelligence.summary",
    "description": "Allows intelligence.summary for Google Calendar.",
    "required": true
  }
];
export const calendarResources: ConnectorResource[] = [
  {
    "id": "calendars",
    "name": "calendars",
    "description": "Google Calendar calendars",
    "classification": "confidential"
  },
  {
    "id": "events",
    "name": "events",
    "description": "Google Calendar events",
    "classification": "confidential"
  },
  {
    "id": "availability",
    "name": "availability",
    "description": "Google Calendar availability",
    "classification": "confidential"
  },
  {
    "id": "invitations",
    "name": "invitations",
    "description": "Google Calendar invitations",
    "classification": "confidential"
  },
  {
    "id": "reminders",
    "name": "reminders",
    "description": "Google Calendar reminders",
    "classification": "confidential"
  }
] as ConnectorResource[];
export const calendarOperations: ConnectorOperation[] = [
  {
    "id": "calendars.list",
    "name": "calendars.list",
    "description": "Google Calendar calendars.list",
    "permission": "google-calendar:calendars.list",
    "deterministic": true,
    "async": true
  },
  {
    "id": "events.list",
    "name": "events.list",
    "description": "Google Calendar events.list",
    "permission": "google-calendar:events.list",
    "deterministic": true,
    "async": true
  },
  {
    "id": "availability.read",
    "name": "availability.read",
    "description": "Google Calendar availability.read",
    "permission": "google-calendar:availability.read",
    "deterministic": true,
    "async": true
  },
  {
    "id": "invitations.list",
    "name": "invitations.list",
    "description": "Google Calendar invitations.list",
    "permission": "google-calendar:invitations.list",
    "deterministic": true,
    "async": true
  },
  {
    "id": "reminders.list",
    "name": "reminders.list",
    "description": "Google Calendar reminders.list",
    "permission": "google-calendar:reminders.list",
    "deterministic": true,
    "async": true
  },
  {
    "id": "events.create",
    "name": "events.create",
    "description": "Google Calendar events.create",
    "permission": "google-calendar:events.create",
    "deterministic": false,
    "async": true
  },
  {
    "id": "events.update",
    "name": "events.update",
    "description": "Google Calendar events.update",
    "permission": "google-calendar:events.update",
    "deterministic": false,
    "async": true
  },
  {
    "id": "intelligence.summary",
    "name": "intelligence.summary",
    "description": "Google Calendar intelligence.summary",
    "permission": "google-calendar:intelligence.summary",
    "deterministic": true,
    "async": true
  }
];
export const calendarCapabilities: ConnectorCapability[] = [{ id: 'google-calendar.workspace', name: 'Google Calendar Workspace Platform', description: 'Runtime-routed Google Workspace operations with deterministic intelligence and approval gates.', deterministic: false, resources: ["calendars","events","availability","invitations","reminders"], operations: ["calendars.list","events.list","availability.read","invitations.list","reminders.list","events.create","events.update","intelligence.summary"] }];
