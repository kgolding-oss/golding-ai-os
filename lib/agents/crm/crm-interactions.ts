import type { CrmInteraction, CrmRelationship } from "./crm-types";
export const interactionsFromRelationships=(relationships:CrmRelationship[]):CrmInteraction[]=>relationships.flatMap((r)=>r.interactionHistory);
export const gmailCalendarCompatibility = { gmail:{ readMetadata:true, sendAutomatically:false }, googleCalendar:{ readMetadata:true, createMeetingsAutomatically:false }, googleDrive:{ metadataOnly:true }, googleDocs:{ metadataOnly:true } };
