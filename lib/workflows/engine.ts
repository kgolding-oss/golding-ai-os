import { WorkflowExecutor } from "./executor";
import { WorkflowRegistry } from "./registry";
import { WorkflowStateStore } from "./state";
import { ExecutiveDailyBriefWorkflow, KnowledgeDiscoveryWorkflow, ReleaseVerificationWorkflow, createEnterpriseWorkflows } from "./workflows";
import type { WorkflowContext } from "./types";

export class WorkflowEngine {
  constructor(private readonly registry: WorkflowRegistry, private readonly state: WorkflowStateStore, private readonly executor: WorkflowExecutor) {}
  listWorkflows() { return this.registry.list().map((workflow) => this.state.summarize(workflow)); }
  getStatus(workflowId?: string) { return workflowId ? this.registry.get(workflowId) ? this.state.summarize(this.registry.get(workflowId)!) : null : this.listWorkflows(); }
  getHistory(workflowId?: string) { return this.state.getHistory(workflowId); }
  async execute(workflowId: string, context: WorkflowContext = {}) { const workflow = this.registry.get(workflowId); if (!workflow) throw new Error(`Workflow ${workflowId} is not registered.`); return this.executor.run(workflow, context); }
}

export function createWorkflowEngine() {
  const state = new WorkflowStateStore(); const registry = new WorkflowRegistry()
    .register(new ExecutiveDailyBriefWorkflow())
    .register(new ReleaseVerificationWorkflow())
    .register(new KnowledgeDiscoveryWorkflow());
  createEnterpriseWorkflows().forEach((workflow) => registry.register(workflow));
  return new WorkflowEngine(registry, state, new WorkflowExecutor(state));
}

export const workflowEngine = createWorkflowEngine();
