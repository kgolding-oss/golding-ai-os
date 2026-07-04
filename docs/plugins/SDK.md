# Plugin SDK

The Plugin SDK lives in `lib/plugins/sdk.ts` and lets developers create departments, workflows, dashboards, knowledge providers, connectors, executive reports, and automation packs without changing core code.

## Manifest creation

Use `createPluginManifest` for general plugins or helpers such as `departmentPlugin`, `workflowPack`, `dashboardWidget`, `knowledgeProvider`, and `connectorPlugin` for common plugin families.

## Required manifest fields

- `id`, `version`, and `author`
- `type` and `capabilities`
- dependencies
- compatibility for core version, workspaces, organizations, and themes
- branding with white-label readiness
- security declarations
