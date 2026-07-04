# Plugin Security

Plugins must explicitly declare permissions, external APIs, storage usage, network access, approval requirements, and audit events.

## Approval requirements

Human approval is required for external writes, submissions, financial promises, legal outputs, publication, connector actions, and automation that can affect customers or third parties.

## Audit events

Plugins should emit lifecycle and domain events such as installation, enablement, disablement, updates, removal, health checks, and action requests.
