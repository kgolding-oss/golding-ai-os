import { createPluginManifest } from "./sdk";
import type { PluginManifest } from "./types";
const compat = { coreVersion: "17.x", workspaces: ["executive", "operations", "customer"], organizations: ["law-library", "enterprise", "white-label"], themes: ["default", "white-label"] };
function official(id:string, name:string, type:PluginManifest["type"], capabilities:PluginManifest["capabilities"], description:string, dependencies:string[] = []) { return createPluginManifest({ id, version:"1.0.0", author:"Golding AI", type, categories:["available","featured","official"], dependencies, capabilities, compatibility: compat, branding:{ name, description, whiteLabelReady:true, accentColor:"#d4af37" }, security:{ permissions: capabilities.map((c)=>({ id:`${id}.${c}`, description:`Allow ${name} to provide ${c} capability.`, approvalRequired:c==="automation"||c==="connector" })), externalApis:[], storage:["organization_scoped_records", "audit_events"], networkAccess:type==="connector"?"external":"restricted", approvalRequirements:["Human approval required for external writes, submissions, financial promises, legal outputs, and publication."], auditEvents:["plugin.installed","plugin.enabled","plugin.health_checked",`${id}.action_requested`] } }); }
export const corePluginCatalog = [
  official("law-library-os","Law Library OS","industry_module",["department","workflow","dashboard","knowledge","report"],"First deployment module for legal knowledge operations, departments, dashboards, and executive reporting."),
  official("funding-os","Funding OS","workflow_pack",["workflow","dashboard","automation","report"],"Grant, donor, sponsor, deadline, proposal, and restricted-fund reporting workflows.",["law-library-os"]),
  official("knowledge-os","Knowledge OS","knowledge_provider",["knowledge","dashboard"],"Shared memory, ingestion, indexing, permissions, and health foundation."),
  official("property-os","Property OS","ai_department",["department","workflow","dashboard"],"Property and asset management department module."),
  official("crm","CRM","ai_department",["department","workflow","dashboard"],"Relationships, partners, donors, sponsors, follow-ups, and segmentation."),
  official("finance","Finance","ai_department",["department","workflow","dashboard","report"],"Budgets, donations, invoices, grants, sponsors, compliance, and forecasts."),
  official("media","Media","ai_department",["department","workflow","dashboard"],"Campaigns, newsletters, social media, podcasts, YouTube, and brand asset operations."),
  official("research","Research","ai_department",["department","knowledge","workflow","report"],"Research queues, sources, citations, evidence monitoring, and briefs."),
  official("executive-office","Executive Office","ai_department",["department","dashboard","report","automation"],"Chief of Staff, executive intelligence, approvals, delegations, and operating rhythm.")
];
