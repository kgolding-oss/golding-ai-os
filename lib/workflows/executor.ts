import { WorkflowStateStore } from "./state";
import type { Workflow, WorkflowContext, WorkflowExecutionRecord } from "./types";
import { recordWorkflowExecution, recordWorkflowStep } from "../persistence";

export class WorkflowExecutor {
  constructor(private readonly state: WorkflowStateStore) {}

  async run<TInput, TData>(workflow: Workflow<TInput, TData>, context: WorkflowContext<TInput>): Promise<WorkflowExecutionRecord<TData>> {
    const executionId = `${workflow.id}-${Date.now()}`;
    const startedAt = (context.now ?? new Date()).toISOString();
    this.state.start(workflow, executionId, startedAt);
    const persistenceContext = { token: context.accessToken, organizationId: context.organizationId, profileId: context.userId, correlationId: context.correlationId };
    await recordWorkflowStep(persistenceContext, { workflowId: workflow.id, executionId, stepName: "started", status: "running", payload: { startedAt } });
    this.state.transition(workflow.id, executionId, "validating");
    const validation = workflow.validate(context);
    if (!validation.valid) {
      const completedAt = new Date().toISOString();
      this.state.transition(workflow.id, executionId, "failed", { completedAt, errors: validation.errors });
      const failedRecord = this.state.getLastExecution(workflow.id) as WorkflowExecutionRecord<TData>;
      await recordWorkflowExecution(persistenceContext, { workflowId: workflow.id, executionId, status: "failed", payload: { workflowName: workflow.name }, result: failedRecord.result, errors: validation.errors });
      return failedRecord;
    }
    try {
      this.state.transition(workflow.id, executionId, "running");
      const result = await workflow.execute(context, executionId);
      const completedAt = new Date().toISOString();
      this.state.transition(workflow.id, executionId, "succeeded", { completedAt, result });
      await recordWorkflowStep(persistenceContext, { workflowId: workflow.id, executionId, stepName: "execute", status: "succeeded", result });
    } catch (error) {
      const completedAt = new Date().toISOString();
      const errors = [error instanceof Error ? error.message : "Unknown workflow error."];
      this.state.transition(workflow.id, executionId, "failed", { completedAt, errors });
      await recordWorkflowStep(persistenceContext, { workflowId: workflow.id, executionId, stepName: "execute", status: "failed", error });
    }
    const record = this.state.getLastExecution(workflow.id) as WorkflowExecutionRecord<TData>;
    await recordWorkflowExecution(persistenceContext, { workflowId: workflow.id, executionId, status: record.state, payload: { workflowName: workflow.name }, result: record.result, errors: record.errors });
    return record;
  }
}
