// All posts in this file are synthetic fixtures, not collected creator content.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const modulePath = process.env.YOUPASSGO_TEST_MODULE;
if (!modulePath) throw new Error('Set YOUPASSGO_TEST_MODULE to the compiled provider.js path');
const { prepareImport, YouPassGoKnowledgeProvider, PROVIDER_ID } = require(path.resolve(modulePath));
const url = 'https://www.tiktok.com/@derrickpwhitehead/video/0000000000000000001';
const row = { url, caption: 'Synthetic caption', transcript: 'Synthetic business credit discussion.', transcriptComplete: true };
const makeReview = (post = row, changes = {}) => ({ postId: '0000000000000000001',
  sourceHash: prepareImport([post]).discovered[0].sourceHash, reviewer: 'Test reviewer', reviewedAt: '2026-01-01T00:00:00Z',
  status: 'approved', basis: 'original_summary', title: 'Synthetic business credit example',
  summary: 'A synthetic example about preparing business credit documentation.', tags: ['business-credit'], ...changes });
const makeProvider = () => new YouPassGoKnowledgeProvider({ organizationId: 'org-test', posts: [row], reviews: [makeReview()] });

test('empty source never claims completeness', () => {
  const result = prepareImport([]);
  assert.equal(result.report.uniquePosts, 0);
  assert.equal(result.report.enumerationComplete, false);
  assert.equal(result.report.expectedPostCount, null);
});
test('captions are not transcripts and cannot approve a video lesson', () => {
  const post = { url, text: 'A caption is not speech' };
  const result = prepareImport([post], [makeReview(post)]);
  assert.equal(result.report.postsWithTranscript, 0);
  assert.equal(result.lessons.length, 0);
});
test('canonicalizes tracking URLs and accepts common export URL alias', () => {
  const result = prepareImport([{ ...row, url: undefined, webVideoUrl: `${url}?tracking=1` }]);
  assert.equal(result.discovered[0].url, url);
});
test('rejects wrong account, domain, scheme, credentials, port and ID', () => {
  const bad = [url.replace('derrickpwhitehead', 'someoneelse'), url.replace('tiktok.com', 'tiktok.com.evil.test'),
    url.replace('https:', 'http:'), url.replace('www.', 'user:password@www.'), url.replace('.com/', '.com:8443/')];
  const result = prepareImport([...bad.map(url => ({ url })), { ...row, id: '9999999999999999999' }]);
  assert.equal(result.report.rejectedRows, 6);
  assert.equal(result.discovered.length, 0);
});
test('deduplicates identical exports', () => {
  const result = prepareImport([row, { ...row }], [makeReview()]);
  assert.equal(result.report.duplicates, 1);
  assert.equal(result.lessons.length, 1);
});
test('quarantines conflicting duplicates', () => {
  const result = prepareImport([row, { ...row, transcript: 'Changed source' }], [makeReview()]);
  assert.equal(result.report.conflictingPosts, 1);
  assert.equal(result.lessons.length, 0);
});
test('raw export cannot promote its own embedded review', () => {
  assert.equal(prepareImport([{ ...row, review: makeReview(), approved: true }]).lessons.length, 0);
});
test('stale reviews do not authorize changed sources', () => {
  assert.equal(prepareImport([{ ...row, transcript: 'Changed source' }], [makeReview()]).lessons.length, 0);
});
test('future or rejected reviews are not approved', () => {
  assert.equal(prepareImport([row], [makeReview(row, { reviewedAt: '2999-01-01' })]).lessons.length, 0);
  assert.equal(prepareImport([row], [makeReview(row, { status: 'rejected' })]).lessons.length, 0);
});
test('duplicate reviews cannot be silently selected', () => {
  assert.equal(prepareImport([row], [makeReview(), makeReview()]).lessons.length, 0);
});
test('partial transcripts are not treated as full source', () => {
  const post = { ...row, transcriptComplete: false };
  assert.equal(prepareImport([post], [makeReview(post)]).lessons.length, 0);
});
test('complete visual-only post supports a separately approved summary', () => {
  const post = { url, visualDescription: 'Synthetic complete visual description', visualComplete: true };
  assert.equal(prepareImport([post], [makeReview(post)]).lessons.length, 1);
});
test('approved output contains original summary but no raw transcript', () => {
  const result = prepareImport([row], [makeReview()]);
  assert.equal(result.lessons[0].claimStatus, 'creator_claim_not_independently_verified');
  assert.equal(JSON.stringify(result).includes(row.transcript), false);
});
test('unconfigured provider fails closed', async () => {
  const provider = new YouPassGoKnowledgeProvider({ posts: [row], reviews: [makeReview()] });
  assert.equal(provider.metadata.searchable, false);
  assert.equal((await provider.search({ query: 'credit', organizationId: 'org-test' })).data.length, 0);
});
test('missing and wrong organizations fail closed', async () => {
  const provider = makeProvider();
  assert.equal((await provider.search({ query: 'credit' })).data.length, 0);
  assert.equal((await provider.search({ query: 'credit', organizationId: 'other-org' })).data.length, 0);
});
test('approved source result includes source URL and claim warning', async () => {
  const result = await makeProvider().search({ query: 'credit', organizationId: 'org-test' });
  assert.equal(result.data.length, 1);
  assert.equal(result.data[0].document.sourceUri, url);
  assert.match(result.data[0].excerpt, /not independently verified/);
});
test('provider filters, metadata filters, zero limits and empty queries are respected', async () => {
  const provider = makeProvider();
  for (const extra of [{ providerIds: ['another-provider'] }, { metadata: { missing: true } }, { limit: 0 }, { query: '' }]) {
    assert.equal((await provider.search({ query: 'credit', organizationId: 'org-test', ...extra })).data.length, 0);
  }
  assert.equal((await provider.search({ query: 'credit', organizationId: 'org-test', providerIds: [PROVIDER_ID] })).data.length, 1);
});
test('tag filters are respected', async () => {
  const provider = makeProvider();
  assert.equal((await provider.search({ query: 'credit', organizationId: 'org-test', tags: ['real-estate'] })).data.length, 0);
  assert.equal((await provider.search({ query: 'credit', organizationId: 'org-test', tags: ['BUSINESS-CREDIT'] })).data.length, 1);
});
test('empty registered provider reports no indexed documents', () => {
  const provider = new YouPassGoKnowledgeProvider({ organizationId: 'org-test' });
  assert.equal(provider.metadata.status, 'degraded');
  assert.equal(provider.metadata.indexedDocumentCount, 0);
});
test('invalid dataset shape is rejected instead of counted as complete', () => {
  assert.throws(() => prepareImport({ items: [row] }), /Expected an array/);
});
