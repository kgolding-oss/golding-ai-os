# Plugin Lifecycle

The loader supports install, enable, disable, update, remove, list installed plugins, health checks, and version compatibility checks.

## Lifecycle states

1. Available in the marketplace catalog.
2. Installed into the organization or workspace scope.
3. Enabled after dependency and compatibility checks.
4. Health checked during operations.
5. Updated when a newer compatible manifest is available.
6. Disabled or removed when no longer approved.

Dependencies must be enabled before dependent plugins can be enabled.
