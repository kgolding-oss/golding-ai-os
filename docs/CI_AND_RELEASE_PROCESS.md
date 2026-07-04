# CI and Release Process

GAIOS uses GitHub Actions as the production safety gate for every pull request and every push to `main`. The workflow validates the platform without changing product architecture, adding agents, or introducing business modules.

## Automated CI Safety Gate

The `GAIOS CI` workflow runs on:

- Every `pull_request`
- Every `push` to the `main` branch

The validation job runs these checks in order:

1. `npm ci` — installs dependencies from `package-lock.json` for a reproducible CI environment.
2. `npm run audit:gaios` — runs the GAIOS platform audit and fails if required platform safeguards are missing.
3. `npx tsc --noEmit` — reports TypeScript errors without writing build artifacts.
4. `npm run lint` — reports lint errors.
5. `npm run build` — verifies the production build completes successfully.

Each check is a separate workflow step so GitHub Actions clearly identifies whether a failure came from dependency installation, the GAIOS audit, TypeScript, linting, or the production build.

## Codex PR Review Checklist

Before a Codex-authored pull request is considered ready for human review, verify that:

- The pull request is scoped to the requested milestone or issue.
- The PR description summarizes reliability, CI, release-safety, or documentation changes only.
- No product architecture, agents, or business modules were added unless explicitly requested.
- The local validation commands were run before opening the PR:
  - `npm run audit:gaios`
  - `npx tsc --noEmit`
  - `npm run lint`
  - `npm run build`
- The GitHub Actions `GAIOS CI` workflow is passing on the PR branch.
- Any CI failure has been fixed in the PR branch before merge.

## Merge Rules

A pull request may be merged only when all of the following are true:

- `GAIOS CI` passes on the latest commit.
- The PR has been reviewed by the required human approver or owner.
- The PR scope matches the approved change request.
- No failing TypeScript, lint, build, or GAIOS audit checks remain.
- The branch is current enough with `main` that CI reflects the code that will be merged.
- Release-impacting changes include updated documentation or verification notes.

Do not merge by bypassing failed checks. If an emergency exception is required, document the reason, risk, owner, rollback plan, and follow-up remediation issue before deployment.

## Production Release Verification

After a merge to `main` and before declaring production healthy, complete the release verification steps below:

1. Confirm the `GAIOS CI` workflow passed on the `main` branch commit selected for deployment.
2. Confirm deployment completed successfully in the production hosting platform.
3. Run the production smoke-test checklist against the deployed environment.
4. Record any failed smoke test with the failing route, observed behavior, expected behavior, owner, and rollback or remediation decision.
5. If a release fails a critical smoke test, pause further rollout and either roll back or apply a verified fix through the same CI safety gate.

## Production Smoke-Test Checklist

Use this checklist after production deployment:

- `/api/health` returns a healthy response.
- `/login` loads and allows the expected authentication path to begin.
- `/dashboard` loads for an authenticated user.
- Executive Command is reachable and renders expected operational context.
- Knowledge OS is reachable and renders expected knowledge-system context.
- Department dashboard is reachable and renders expected department context.
- Workflow registry is reachable and lists expected workflows.
- Approval gates are visible where required and enforce the expected approval flow.

## Failure Reporting Expectations

When CI fails, use the failed workflow step as the first triage signal:

- **GAIOS audit failure:** inspect the audit output and restore the missing platform safeguard.
- **TypeScript failure:** inspect `npx tsc --noEmit` output and fix type errors before merge.
- **Lint failure:** inspect `npm run lint` output and fix the reported lint errors before merge.
- **Build failure:** inspect `npm run build` output and fix the production build issue before merge or deployment.

A PR is not production-ready until these failures are resolved and CI passes on the latest commit.
