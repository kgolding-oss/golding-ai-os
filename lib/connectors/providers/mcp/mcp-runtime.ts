import { McpClient } from "./mcp-client"; import { createMcpSession } from "./mcp-sessions"; export class McpRuntime{async execute(serverId:string,toolId:string,input:unknown){const session=createMcpSession(serverId,{toolId}); const client=new McpClient(serverId); const result=await client.executeTool(toolId,input); return {session,result};}}
export const mcpRuntime=new McpRuntime();
