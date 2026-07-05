# Live Data Onboarding

GAIOS uses a controlled Live Data Onboarding Center to move from seeded/demo data to real organizational data without automatic exposure. Existing seed and fallback data remains available while live sources are staged behind approval gates.

## Registered source types

- Mac Knowledge Vault inventory
- Google Drive
- Gmail
- Google Calendar
- Supabase operational tables
- Manual CSV import
- Manual JSON import

Each source is registered with a workspace mapping, data classification, onboarding status, staged-record count, sensitive categories, required approval gates, next safe action, and audit trail.

## Status model

Sources move through `not_connected`, `discovered`, `pending_review`, `approved_for_indexing`, `indexed_metadata_only`, `indexed_content`, `failed`, and `disabled`. Metadata discovery does not authorize content indexing, relationship linking, or AI-agent exposure.

## Default safety posture

All live sources default to no automatic content ingestion. Gmail, Calendar, Drive, manual imports, and vault inventory records are blocked from AI exposure until a steward approves the specific gate for the source and workspace.
