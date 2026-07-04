# AI Cost Tracking

`CostEvent` records provider, workspace, department, workflow, capability, estimated USD cost, and timestamp. `summarizeCosts()` returns daily, weekly, and monthly estimated AI spend plus cost by provider, workspace, department, workflow, and capability.

The dashboard can use `aiIntegrationHub.dashboard(events).costs` for monthly estimates and spend breakdowns. Default provider cost tiers are intentionally conservative until live usage metering is connected.
