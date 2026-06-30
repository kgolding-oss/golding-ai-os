export type SupabaseConnectorEvent = { type: string; correlationId: string; message: string; at: string; metadata?: Record<string, unknown> };
const events: SupabaseConnectorEvent[] = [];
export function emitSupabaseEvent(event: Omit<SupabaseConnectorEvent, "at">) { events.push({ ...event, at: new Date().toISOString() }); if (events.length > 300) events.shift(); }
export const listSupabaseEvents = () => [...events];
