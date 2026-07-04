# Connector Registry

Milestone 18 standardizes connector discovery for AI routing. Connectors expose id, name, capabilities, health, configured status, required credentials, approval requirements, execute placeholder, observe placeholder, and plugin readiness.

Initial connectors are Supabase, GitHub, Google Drive, Gmail, Google Calendar, Vercel, Browser, Filesystem / Mac Knowledge Vault placeholder, and MCP. Writes and destructive operations remain approval-gated and should execute through Connector Runtime, never by bypassing policy.
