import type { ModelDefinition, AiExecutionRequest, AiExecutionResult } from "../../../ai";
export type OpenAIConnectorConfig={apiKey?:string;organizationId?:string;projectId?:string;baseUrl?:string};
export type OpenAIModelMetadata=ModelDefinition;
export type OpenAIRuntimeRequest=AiExecutionRequest;
export type OpenAIRuntimeResult=AiExecutionResult;
