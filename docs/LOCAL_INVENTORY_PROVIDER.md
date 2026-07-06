# Local Inventory Provider

`MacGOLDInventoryProvider` is the initial provider abstraction for the local SQLite inventory database at `~/GAIOS_FILE_INVENTORY/gaios_inventory.db`.

When the SQLite database and `sqlite3` reader are available, the provider attempts read-only queries against common Workstation inventory table/column names for total files, total size, category counts, extension counts, and largest files. It never writes to the database and invokes SQLite with read-only access.

The provider also exposes largest folders, duplicate summary, review queue count, and sensitive category count. Duplicate summary values preserve the known GOLD inventory metrics: 323,472 duplicate groups, 1,017,857 duplicate files, and 65,569,907,457 duplicate-waste bytes.

CI and Vercel do not require the local database to exist. If unavailable or unreadable, the provider returns deterministic fallback data based on the known GOLD inventory scale: 1,409,576 files and 396.85 GB indexed.

GAIOS Workstation performs inventory, extraction, content indexing, and rename/move planning. GAIOS Product consumes only read-only summaries and advisory recommendations.
