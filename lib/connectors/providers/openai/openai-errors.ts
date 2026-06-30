export class OpenAIProviderError extends Error{constructor(public code:string,message:string,public metadata:Record<string,unknown>={}){super(message);}}
