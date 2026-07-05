# Safe Ingestion Policy

GAIOS does not automatically ingest sensitive live records. The safe ingestion path is:

1. Register or connect a source with least-privilege discovery settings.
2. Stage metadata only, such as source name, record count, schemas, folder labels, or manifest fields.
3. Classify the data and assign it to a workspace.
4. Present sensitive categories, staged counts, ingestion errors, and next safe actions in the dashboard.
5. Require explicit approval before content indexing, contact/email/calendar import, relationship linking, or AI-agent exposure.
6. Record every decision in the onboarding audit trail.

Destructive actions are out of scope for onboarding. Manual CSV and JSON imports must use a dry-run manifest before records can enter operational tables. Seed and fallback data must not be removed while live data is being staged.
