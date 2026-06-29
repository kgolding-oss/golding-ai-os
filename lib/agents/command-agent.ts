import { AbstractBaseAgent } from "./base-agent";
import { commandRegistry } from "./command-registry";
import type { CommandAgentContext, CommandAgentInput } from "./command-registry";
import type { AgentRunResult } from "../types/agent";

export class ExecutiveCommandAgent extends AbstractBaseAgent<CommandAgentInput> {
  constructor() {
    super({
      id: "executive-command-agent",
      name: "Executive Command Agent",
      role: "Deterministic executive command router",
      description: "Routes supported executive commands to registry handlers without LLM calls or external APIs.",
      version: "1.0.0",
      organizationScope: "organization",
      availableCommands: commandRegistry.list(),
      availableTools: [],
    });
  }

  override validate(context?: CommandAgentContext): string[] {
    const errors = super.validate();
    if (!context?.input?.command?.trim()) errors.push("Command text is required.");
    if (!this.availableCommands.length) errors.push("At least one registered command is required.");
    return errors;
  }

  override getRecommendations(context?: CommandAgentContext): string[] {
    const commandText = context?.input?.command ?? "";
    if (!commandRegistry.match(commandText)) return ["Ask for command help or use one of the supported command labels."];
    return ["Run the matched deterministic command handler."];
  }

  async run(context: CommandAgentContext): Promise<AgentRunResult> {
    const commandText = context.input?.command ?? "";
    if (!commandText.trim()) return commandRegistry.help(commandText);
    return commandRegistry.execute(context, commandText);
  }
}

export const executiveCommandAgent = new ExecutiveCommandAgent();
