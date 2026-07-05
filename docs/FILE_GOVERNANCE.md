# File Governance

Mac Knowledge Vault governance blocks destructive file operations for this milestone.

Blocked actions include file deletion, movement, renaming, filesystem writes, automatic uploads, automatic content indexing, and SQLite inventory edits.

Every cleanup, deduplication, migration, upload, or archive action must be represented as an approval-gated recommendation only:

```ts
recommendationOnly: true
requiresHumanApproval: true
executionSupported: false
```

Future milestones may add approval workflows, but execution remains unsupported until explicitly designed and approved.
