export * from './shared';
export * from './gmail'; export * from './calendar'; export * from './drive'; export * from './docs'; export * from './sheets';
import { gmailConnector } from './gmail'; import { calendarConnector } from './calendar'; import { driveConnector } from './drive'; import { docsConnector } from './docs'; import { sheetsConnector } from './sheets';
export const googleWorkspaceConnectors = [gmailConnector, calendarConnector, driveConnector, docsConnector, sheetsConnector];
