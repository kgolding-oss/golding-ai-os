import type { CrmContactRegistryType, CrmLifecycleStage, CrmRelationshipType } from "./crm-types";
export const crmContactRegistry: { type: CrmContactRegistryType; label: string; metadataOnly: boolean }[] = ["individual","business","nonprofit","government","educational_institution","media","law_firm","volunteer","donor","sponsor"].map((type)=>({ type: type as CrmContactRegistryType, label: type.replace(/_/g," "), metadataOnly: true }));
export const crmRelationshipRegistry: { type: CrmRelationshipType; label: string }[] = ["client","prospective_client","volunteer","donor","sponsor","partner","board_member","vendor","contractor","community_organization","government_agency","law_firm","media_contact"].map((type)=>({ type: type as CrmRelationshipType, label: type.replace(/_/g," ") }));
export const crmLifecycleStages: CrmLifecycleStage[] = ["lead","contacted","qualified","active","awaiting_response","onboarding","engaged","inactive","archived"];
export const isRegisteredContactType=(type:string): type is CrmContactRegistryType => crmContactRegistry.some((entry)=>entry.type===type);
export const isRegisteredRelationshipType=(type:string): type is CrmRelationshipType => crmRelationshipRegistry.some((entry)=>entry.type===type);
export const isRegisteredLifecycleStage=(stage:string): stage is CrmLifecycleStage => crmLifecycleStages.includes(stage as CrmLifecycleStage);
