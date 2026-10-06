# YouPassGo source brain: staged import and retrieval

## Actual status on October 6, 2026

The requested TikTok account is https://www.tiktok.com/@derrickpwhitehead. Firecrawl is connected and was tested. Its direct scraper and browser both returned an unsupported-site error. Oriane via Firecrawl returned indexed profile metadata reporting 1,133 posts, but its exact-handle, full-detail post search returned zero indexed posts. This profile count is not a verified live inventory. Public web access also returned no usable account post inventory or transcripts.

**Zero actual posts, transcripts or creator-derived lessons have been imported. This is not a completed scrape, trained model, deployed chat feature or populated knowledge base.** No paid lessons or another platform's material have been substituted. No production deployment, database, default registry, organization description or model configuration was changed.

## What was built

`lib/knowledge/youpassgo/provider.ts` implements an import function and a read-only Knowledge OS search provider. It validates exact creator/post URLs, keeps source fingerprints, distinguishes captions from transcripts, detects conflicting duplicates, and requires separate source reviews before returning original summaries. Returned claims remain labeled as not independently verified.

`lib/knowledge/youpassgo/data.ts` is deliberately empty. The module makes no network, transcription, embedding or language-model calls. It is a foundation for connecting permitted source material, not a replacement for source acquisition.

## Import contract

Call `prepareImport(posts)` with a JSON-array export. Each row accepts `url` or `webVideoUrl`, an optional matching `id`, `caption` or `text`, actual `transcript` with explicit `transcriptComplete`, and optionally `visualDescription` with explicit `visualComplete` for visual material. A caption never counts as spoken content. Full-source flags are upstream attestations, not independent verification by this adapter.

The result includes unique post IDs, source hashes, errors and coverage counts. It does not retain raw transcripts in the output. Keep authorized original material in private organization-scoped storage outside the public repository.

Pass a SEPARATE trusted review array with `postId`, matching `sourceHash`, `reviewer`, `reviewedAt`, `status` (approved/rejected), `basis` (original_summary), `title`, original `summary`, and `tags`. A scraped payload must not supply trusted reviewer identity or approval. Changed source hashes, conflicting duplicates, duplicate reviews, incomplete source records and invalid dates withhold the corresponding lesson.

Approval means the synopsis was checked against its source. It does not prove a creator's financial, legal or other claims are true. The importer always reports account-wide enumeration as incomplete: it cannot establish that every public post has been acquired.

## Integration still required

Use the module server-side because it imports Node hashing. Authenticate the user and resolve the YouPassGo organization ID from trusted membership; never trust an organization ID supplied directly by a browser. Then instantiate `YouPassGoKnowledgeProvider({ organizationId, posts, reviews })` and add it through `registry.registerSearchProvider(provider)`. This draft does not modify the default registry.

Wire `BRAIN_RULES` into the actual model instructions before use. The rules require attribution, separation of source text from instructions, no implied creator endorsement, and current primary-source verification before high-stakes recommendations. These exported rules are not automatically enforced by an existing model and do not constitute a complete prompt-injection defense. No action-taking tools are added.

Use a reviewed source library rather than treating one creator as an unquestionable authority. Suggested future organizational categories include business structure, credit, funding readiness and capital strategy; these are proposed categories, not findings from videos that were accessed.

The provider's mutable objects are intended for trusted server-side construction. Do not expose them as a public write interface. Production hardening, persistence, authorization wiring, source-withdrawal handling and end-to-end model behavior remain to be implemented and tested.

## Verified tests and limits

The provider passed an isolated strict TypeScript 5.8.3 compilation with Node type definitions and a locally copied subset of the inspected repository's Knowledge OS interfaces. All 20 synthetic tests passed under Node 22.16.0. Tests cover empty-source behavior, attribution, invalid URLs, duplicate handling, changed-source reviews, transcript coverage, organization scoping and retrieval filters. Synthetic fixtures are not part of the teaching library.

The whole repository was not available in the working container: a GitHub clone attempt failed because the container could not resolve github.com. Therefore no full Next.js build, full registry-graph compilation, authenticated browser test, production test or live deployment was performed. Existing repository source was inspected through the GitHub connector.

After compiling `provider.ts` as CommonJS, set `YOUPASSGO_TEST_MODULE` to the absolute path of the compiled `provider.js`, then run:

```sh
node --test scripts/tests/youpassgo-brain.test.cjs
```

The observed test result is recorded in `docs/YOUPASSGO_TEST_REPORT.json`.

## What unblocks the requested brain

An accessible source export or a TikTok-capable collector must provide the account's actual public post URLs, captions, transcripts and relevant visual information. A profile lookup does not provide that teaching material. Once acquired, source-linked original summaries and independent verification can be used to populate the module before authenticated application integration and activation.

No background scraping, subscription, recurring automation or production change has been started.
