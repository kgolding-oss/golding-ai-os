import type { MediaStage } from "./media-types";
export const blockedAutonomousMediaActions = ["publish","post","send_newsletter","upload_media","release_podcast","schedule_publication","approve_publishing"] as const;
export function requiresMediaApproval(action:string){ return blockedAutonomousMediaActions.includes(action as never); }
export function canAdvanceMediaStageAutomatically(){ return false; }
export function validateManualStageAdvance(from:MediaStage,to:MediaStage){ return { allowed: from!==to, reason: from===to?"Stage is unchanged.":"Stage changes require explicit human action and audit." }; }