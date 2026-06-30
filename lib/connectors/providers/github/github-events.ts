export type GitHubConnectorEvent = { type: string; correlationId: string; message: string; at: string; metadata?: Record<string, unknown> };
const events: GitHubConnectorEvent[] = [];
export function emitGitHubEvent(event: Omit<GitHubConnectorEvent, "at">) { events.push({ ...event, at: new Date().toISOString() }); if (events.length > 200) events.shift(); }
export const listGitHubEvents = () => [...events];
