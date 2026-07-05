# Mac Knowledge Vault

The Mac Knowledge Vault connects Karim's Mac/GOLD file inventory to GAIOS as a read-only metadata source. It uses `~/GAIOS_FILE_INVENTORY/gaios_inventory.db` as the first integration path and does not scan the filesystem directly.

## Product / Workstation split

GAIOS Workstation owns local machine work: inventory collection, file extraction, content indexing, duplicate analysis, and rename/move planning. Workstation may produce `gaios_inventory.db`, `gaios_content.db`, `inventory.csv`, and `inventory.json` outside the hosted product.

GAIOS Product only consumes read-only summaries from those outputs when they are available. Product surfaces advisory recommendations, review queues, duplicate summaries, largest-file/folder summaries, and approval-gated planning context; it does not execute filesystem changes.

## Safety model

GAIOS must not delete, move, rename, upload, rewrite, or content-index local files. The vault only reads inventory metadata and returns advisory recommendations with `recommendationOnly: true`, `requiresHumanApproval: true`, and `executionSupported: false`.

## Workspace mapping

Inventory categories map into GAIOS workspaces, including Relax With Me to Business Portfolio, Immigration to Law Library / Legal Operations, The Law Library - Funding to Funding OS, AI / Development to Platform Engineering, media categories to Media Department, Finance to Finance Department, Personal Vault to Personal / Restricted, and 99 Review to a classification queue.

## Dashboard

The executive dashboard includes a Mac Knowledge Vault panel with source status, total files, total size, category counts, extension counts, largest files, largest folders, duplicate summary, review queue count, sensitive category count, next safe actions, and read-only safety status.
