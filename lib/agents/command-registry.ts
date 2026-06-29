import type { AgentCommand, AgentCommandContext, AgentCommandResponse } from "../types/agent";

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function parseCommand(input: string) {
  return normalize(input);
}

export class CommandRegistry {
  private readonly commands = new Map<string, AgentCommand>();

  constructor(commands: AgentCommand[] = []) {
    commands.forEach((command) => this.register(command));
  }

  register(command: AgentCommand) {
    this.commands.set(command.id, command);
    return this;
  }

  list() {
    return Array.from(this.commands.values()).sort((a, b) => a.label.localeCompare(b.label));
  }

  find(input: string) {
    const parsed = parseCommand(input);
    return this.list().find((command) => command.id === input || parseCommand(command.label) === parsed || command.phrases?.some((phrase) => parseCommand(phrase) === parsed));
  }

  execute(input: string, context: AgentCommandContext): AgentCommandResponse {
    const command = this.find(input);
    if (command) return command.handler(context);
    const availableCommands = this.list().map(({ id, label, description, category }) => ({ id, label, description, category }));
    return { commandId: "help", label: "Available executive commands", output: this.list()[0]?.handler(context).output ?? { executiveBrief: { title: "No command registered", summary: "Register commands before running the Command Agent.", metrics: {}, organization: context.organization, generatedAt: (context.now ?? new Date()).toISOString() }, attentionQueue: [], recommendations: [], blockers: [], timeline: [], suggestedNextActions: [] }, help: { message: `Unknown command: ${input}. Choose one of the available commands.`, availableCommands } };
  }
}
