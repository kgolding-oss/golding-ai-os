import type { ResearchCategory, SourceType } from "./research-types";
export const researchCategories: ResearchCategory[]=["legal","immigration","policy","grants","funders","sponsors","partners","media","competitors","regulatory","case law","legislation","community","operations","property","finance"];
export const researchSourceTypes: SourceType[]=["case_law","statute","regulation","agency_guidance","court_rule","administrative_policy","detention_policy","news","grant_database","website","document","email","knowledge_os","manual_reference"];
export const connectorOnlySources=["google_drive","google_docs","gmail","google_calendar","supabase","knowledge_os"] as const;
export function isResearchCategory(value:string):value is ResearchCategory{return researchCategories.includes(value as ResearchCategory)}
export function researchRegistryHealth(){return{status:"healthy" as const,categories:researchCategories.length,sourceTypes:researchSourceTypes.length,connectors:connectorOnlySources.length,message:"Research registry models are deterministic and connector-runtime scoped."}}
