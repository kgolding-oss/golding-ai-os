import type { Workflow, WorkflowExecutionRecord, WorkflowExecutionState, WorkflowSummary } from "./types";

export class WorkflowStateStore {
  private current = new Map<string, WorkflowExecutionState>();
  private history = new Map<string, WorkflowExecutionRecord[]>();

  getCurrentState(workflowId: string): WorkflowExecutionState { return this.current.get(workflowId) ?? "pending"; }
  getHistory(workflowId?: string): WorkflowExecutionRecord[] { return workflowId ? [...(this.history.get(workflowId) ?? [])] : Array.from(this.history.values()).flat(); }
  getLastExecution(workflowId: string): WorkflowExecutionRecord | null { return this.getHistory(workflowId).at(-1) ?? null; }

  start(workflow: Workflow, executionId: string, startedAt: string): WorkflowExecutionRecord {
    const record: WorkflowExecutionRecord = { id: executionId, workflowId: workflow.id, workflowName: workflow.name, state: "pending", startedAt, errors: [] };
    this.append(record); this.current.set(workflow.id, "pending"); return record;
  }

  transition(workflowId: string, executionId: string, state: WorkflowExecutionState, patch: Partial<WorkflowExecutionRecord> = {}) {
    this.current.set(workflowId, state);
    const records = this.history.get(workflowId) ?? [];
    const index = records.findIndex((record) => record.id === executionId);
    if (index >= 0) records[index] = { ...records[index], ...patch, state };
  }

  summarize(workflow: Workflow): WorkflowSummary {
    const last = this.getLastExecution(workflow.id);
    return { id: workflow.id, name: workflow.name, description: workflow.description, status: workflow.status, triggerType: workflow.triggerType, currentState: this.getCurrentState(workflow.id), lastExecutionAt: last?.completedAt ?? last?.startedAt ?? null };
  }

  private append(record: WorkflowExecutionRecord) { this.history.set(record.workflowId, [...(this.history.get(record.workflowId) ?? []), record]); }
}
