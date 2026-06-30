# Grant Development & Funding Agent

The Grant Development & Funding Agent coordinates the funding lifecycle for foundation grants, government grants, corporate giving, sponsorships, fiscal sponsorship, individual donors, major gifts, and in-kind donations. It is orchestrated by the Executive Chief of Staff and never submits applications or sends funder communications automatically.

## Architecture

The agent lives in `lib/agents/grant-development/` and follows the operational-agent pattern: types, registry, deterministic scoring, deadline calendar, document metadata, risk intelligence, telemetry, runtime synthesis, dashboard projection, and policy gates.

## Funding lifecycle

Opportunities are tracked from discovery through qualification, LOI, application, interview, award/decline, reporting, and renewal. Each opportunity records organization, funder, program, eligibility, amount, probability, deadline, stage, owner, required documents, approvals, reporting requirements, and renewal schedule.

## Opportunity registry

The registry supports federal, state, local, foundation, corporate, community, international, private, and sponsorship opportunity categories. Registry validation prevents unsupported opportunity classes from entering the pipeline.

## Scoring engine

Scoring is deterministic and does not use LLM reasoning. It calculates eligibility, strategic alignment, effort readiness, probability, funding impact, reporting burden, urgency, and a weighted priority score.

## Deadline engine

The deadline engine tracks LOIs, applications, interviews, reporting, renewals, sponsor deliverables, and compliance dates. Due-soon and overdue statuses feed Executive Intelligence recommendations.

## Documents and Knowledge OS

Document management tracks narratives, budgets, board lists, IRS documents, financials, audits, letters of support, attachments, and submitted packages. Google Drive, Google Docs, Sheets, Supabase, and Knowledge OS are represented as metadata providers only; no embeddings are created for funding documents in this milestone.

## Chief of Staff integration

The Chief of Staff delegates opportunity qualification, sponsor follow-ups, document requests, reporting deadlines, and renewal planning to the Grant Agent. The Grant Agent reports deterministic progress back and never bypasses Approval Engine.

## AI Runtime usage

AI Runtime may only summarize, compare documents, classify opportunities, organize drafts, and extract requirements. It must not fabricate eligibility, funder details, or application content.

## Dashboard and Command Agent

The Grant Development panel shows active opportunities, pipeline value, upcoming deadlines, missing documents, renewal schedule, reporting status, funding forecast, and opportunity score. Command Agent commands expose grant dashboard, funding pipeline, deadlines, reporting status, opportunity summary, sponsor summary, score explanation, and funding forecast.

## Persistence and observability

The runtime exposes health through `/api/health` and records telemetry for opportunities, deadlines, scoring, document completion, reporting, and trends. Persistence contracts cover opportunities, grant memory, reporting history, sponsor history, scoring history, and telemetry.

## Security

The agent cannot submit applications, send sponsor emails, bypass Chief of Staff, bypass Connector Runtime, bypass Approval Engine, or invent opportunities. Human review and approval are required before external commitments or submissions.

## Known limitations

This milestone provides deterministic architecture and demo-safe in-memory records. Production synchronization with live funder databases and connector-backed persistence should be added in a later milestone.
