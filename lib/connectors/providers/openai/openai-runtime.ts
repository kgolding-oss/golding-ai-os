import type { OpenAIRuntimeRequest, OpenAIRuntimeResult } from "./openai-types"; import { executeAiRequest, modelRegistry } from "../../../ai";
export class OpenAIRuntime{discoverModels(){return modelRegistry.discover("openai");} async execute(request:OpenAIRuntimeRequest):Promise<OpenAIRuntimeResult>{return executeAiRequest({...request,metadata:{...request.metadata,provider:"openai"}});} stream(){return new ReadableStream({start(controller){controller.enqueue("streaming abstraction registered"); controller.close();}});}}
export const openAIRuntime=new OpenAIRuntime();
