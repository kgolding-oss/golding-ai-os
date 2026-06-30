export type VercelConnectorEvent = { type: string; correlationId: string; message: string; at: string; metadata?: Record<string, unknown> };
const events: VercelConnectorEvent[] = [];
export function emitVercelEvent(event: Omit<VercelConnectorEvent, "at">) { events.push({ ...event, at: new Date().toISOString() }); if (events.length > 300) events.shift(); }
export const listVercelEvents = () => [...events];
