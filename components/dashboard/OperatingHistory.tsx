import type { OperatingHistory as OperatingHistoryData, PersistentRecord } from "../../lib/persistence";
import { Widget } from "./Widget";

function label(record: PersistentRecord) {
  const payload = record.payload ?? {};
  return String((payload.commandText as string) ?? record.workflow_id ?? record.agent_id ?? record.correlation_id ?? record.id);
}
function Rows({ title, records, empty }: { title: string; records: PersistentRecord[]; empty: string }) {
  return <div><h3>{title}</h3><div className="list">{records.length ? records.map((record) => <div className="row" key={`${title}-${record.id}`}><div><strong>{label(record)}</strong><span>{record.status} · {record.created_at ? new Date(record.created_at).toLocaleString() : "not recorded"}</span></div><em>{record.correlation_id ?? "no correlation"}</em></div>) : <p className="muted">{empty}</p>}</div></div>;
}
export function OperatingHistory({ history }: { history: OperatingHistoryData }) {
  return <Widget title="Operating History" eyebrow="Persistent execution audit"><div className="historyGrid"><Rows title="Recent command executions" records={history.commands} empty="No durable command executions have been recorded yet." /><Rows title="Recent workflow executions" records={history.workflows} empty="No durable workflow executions have been recorded yet." /><Rows title="Recent orchestration events" records={history.orchestrationEvents} empty="No durable orchestration events have been recorded yet." /><Rows title="Recent failed events" records={history.failedEvents} empty="No failed persistent events are visible." /><Rows title="Recent health snapshots" records={history.healthSnapshots} empty="No durable health snapshots have been recorded yet." /></div></Widget>;
}
