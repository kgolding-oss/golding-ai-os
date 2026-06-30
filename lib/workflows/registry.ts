import type { Workflow } from "./types";

export class WorkflowRegistry {
  private workflows = new Map<string, Workflow>();
  register(workflow: Workflow) { this.workflows.set(workflow.id, workflow); return this; }
  get(workflowId: string) { return this.workflows.get(workflowId) ?? null; }
  list() { return Array.from(this.workflows.values()); }
}
