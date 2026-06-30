import { WorkflowStateStore } from "./state";
import type { Workflow, WorkflowContext, WorkflowExecutionRecord } from "./types";

export class WorkflowExecutor {
  constructor(private readonly state: WorkflowStateStore) {}

  async run<TInput, TData>(workflow: Workflow<TInput, TData>, context: WorkflowContext<TInput>): Promise<WorkflowExecutionRecord<TData>> {
    const executionId = `${workflow.id}-${Date.now()}`;
    const startedAt = (context.now ?? new Date()).toISOString();
    this.state.start(workflow, executionId, startedAt);
    this.state.transition(workflow.id, executionId, "validating");
    const validation = workflow.validate(context);
    if (!validation.valid) {
      const completedAt = new Date().toISOString();
      this.state.transition(workflow.id, executionId, "failed", { completedAt, errors: validation.errors });
      return this.state.getLastExecution(workflow.id) as WorkflowExecutionRecord<TData>;
    }
    try {
      this.state.transition(workflow.id, executionId, "running");
      const result = await workflow.execute(context, executionId);
      const completedAt = new Date().toISOString();
      this.state.transition(workflow.id, executionId, "succeeded", { completedAt, result });
    } catch (error) {
      const completedAt = new Date().toISOString();
      this.state.transition(workflow.id, executionId, "failed", { completedAt, errors: [error instanceof Error ? error.message : "Unknown workflow error."] });
    }
    return this.state.getLastExecution(workflow.id) as WorkflowExecutionRecord<TData>;
  }
}
