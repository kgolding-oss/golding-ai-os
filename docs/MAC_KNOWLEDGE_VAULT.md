# Mac Knowledge Vault

The Mac Knowledge Vault connects Karim's Mac/GOLD file inventory to GAIOS as a read-only metadata source. It uses `~/GAIOS_FILE_INVENTORY/gaios_inventory.db` as the first integration path and does not scan the filesystem directly.

## Safety model

GAIOS must not delete, move, rename, upload, rewrite, or content-index local files. The vault only reads inventory metadata and returns advisory recommendations with `recommendationOnly`, `requiresHumanApproval`, and `executionSupported: false`.

## Workspace mapping

Inventory categories map into GAIOS workspaces, including Relax With Me to Business Portfolio, Immigration to Law Library / Legal Operations, The Law Library - Funding to Funding OS, AI / Development to Platform Engineering, media categories to Media Department, Finance to Finance Department, Personal Vault to Personal / Restricted, and 99 Review to a classification queue.

## Dashboard

The executive dashboard includes a Mac Knowledge Vault panel with source status, inventory scale, top categories, storage risks, review queues, sensitive categories, next safe actions, and read-only safety status.
