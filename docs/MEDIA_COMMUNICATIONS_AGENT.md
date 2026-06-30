# Media & Communications Agent

## Architecture
The Media & Communications Agent is a specialized operational agent under `lib/agents/media-communications`. It follows the established registry/runtime/dashboard pattern used by other operational agents and does not replace shared runtime, connector, workflow, persistence, observability, approval, or dashboard infrastructure.

## Content Registry
Content records are registry-driven and track title, organization, campaign, platform, content type, status, owner, tags, publish windows, approval state, assets, transcript, description, and analytics metadata. Registered platforms include YouTube, podcasts, newsletters, blog articles, press releases, Instagram, Facebook, LinkedIn, X, TikTok, community campaigns, and brand operations.

## Production Workflow
The deterministic content pipeline is: idea, research, outline, draft, review, approval pending, approved, scheduled, published, archived. AI helpers cannot advance stages automatically; stage changes require explicit human action and audit.

## Publishing Lifecycle
Publishing, scheduling, newsletter sending, media uploads, podcast releases, and social posting are blocked autonomous actions. The agent generates reminders, metadata, summaries, and queues only. Publishing remains behind the Approval Engine.

## Campaign Engine
Campaigns track objectives, owner, status, dates, platforms, content IDs, and tags. Campaign health is deterministic: content counts, approval bottlenecks, missing assets, inactive campaigns, and backlog are derived from registry records.

## YouTube
The YouTube tracker stores videos, thumbnails, titles, descriptions, transcripts, playlists/shorts metadata, and production status. Uploads are disabled.

## Podcast
The podcast tracker stores episodes, guests/metadata, recordings, editing status, and publishing schedules. Publishing is disabled.

## Newsletter
Newsletter records track issues, audience metadata, drafts, approval state, and schedule windows. Sending is disabled.

## Brand Management
Brand management tracks logos, colors, fonts, templates, approved messaging, and reusable assets through metadata records.

## Chief of Staff Integration
The agent exposes delegation types for campaign planning, newsletter review, podcast production, YouTube production, social media planning, press coordination, and media approvals. Delegations return completion status and remain coordination records.

## Executive Intelligence Integration
The planner generates deterministic recommendations for overdue content, inactive campaigns, missing assets, approval bottlenecks, publishing backlog, production delays, and engagement opportunities without forecasting.

## Dashboard
The Media & Communications dashboard panel displays active campaigns, content pipeline, publishing calendar, YouTube production, podcast production, newsletter status, social media queue, brand assets, approval queue, and production risks.

## Command Agent
Command Agent additions include media dashboard, campaign summary, publishing calendar, YouTube status, podcast status, newsletter status, social media queue, content pipeline, brand assets, media approvals, and explain campaign health.

## Persistence
The initial milestone uses the shared in-process memory pattern for snapshots and provides typed persistence boundaries for campaigns, content registry, media memory, production history, asset metadata, analytics summaries, and telemetry. Supabase persistence can be attached through existing persistence repositories in a later migration.

## Observability
`/api/health` includes Media & Communications health with campaigns, pipeline, publishing calendar, approvals, production, analytics, and telemetry.

## Security
The media policy explicitly blocks autonomous publishing, posting, sending, scheduling, uploading, releasing, and approval. AI may only perform summaries, transcript cleanup, classification, metadata generation, duplicate detection, and asset organization.

## Future Extensions
Future work can add durable Supabase tables, connector-backed Google Drive/Docs/Calendar metadata sync, Knowledge OS metadata ingestion, analytics connector imports, and Approval Engine request records for each blocked publishing action.
