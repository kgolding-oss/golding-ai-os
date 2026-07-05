# Local Inventory Provider

`MacGOLDInventoryProvider` is the initial provider for the local SQLite inventory database at `~/GAIOS_FILE_INVENTORY/gaios_inventory.db`.

The provider represents database path, source name, mounted volume, total files, total size, category counts, extension counts, largest files, largest folders, media counts, likely duplicate placeholders, sensitive category placeholders, and last inventory time.

CI does not require the database to exist. If unavailable, the provider returns deterministic fallback data based on the known inventory scale of about 1.4 million files and about 396 GB.

The provider is a read-only metadata abstraction. It does not write to the database or scan the filesystem.
