# Release Manager

The release manager foundation provides deterministic release health checks without external API calls.

## Output

- repository
- database
- authentication
- organizationContext
- runtime
- deployment
- productionReady
- blockers
- recommendations

## Current limits

The checker uses local/static application context and existing dashboard data. It does not yet call GitHub, Supabase administration APIs, Vercel APIs, or external monitoring tools.
