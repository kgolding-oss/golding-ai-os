# Graph Query Engine

The graph query engine answers relationship questions across organizational memory. It accepts structured filters for organization id, natural-language text, node ids, node types, relationship types, tags, timeline windows, and result limits.

## Supported Questions

Examples include: show everything related to Keith Murray; show grants connected to Orange Trees; show every sponsor connected to podcasts; show board decisions related to funding; find all projects involving Golding Compound; show documents mentioning ICE detention.

## Result Shape

Every query returns:

- `nodes`: matched and connected entities.
- `edges`: relationships among matched entities.
- `relationshipCounts`: edge counts by relationship type.
- `timeline`: chronological events touching returned nodes or edges.
- `heatMap`: simple node-type intensity buckets.
- `entityHealth`: health by node id.
- `dependencyTrees`: dependencies derived from `depends_on` edges.

## Plugin Compatibility

Knowledge-provider plugins can expose `PluginGraphProvider.registerGraphEntities()` through the Plugin SDK. The returned graph registration can be passed to the Knowledge Graph Engine without changing core plugin manifests.
