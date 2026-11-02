import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyPublicationDates, assertDateOnlyChange } from './publication-dates.mjs';
import { prepareSnapshot } from './snapshot-build.mjs';

test('date overlay preserves complete posts and collections, supports clearing and rejects changed content', () => {
  const base = { posts: [{ sourceId: 'a', slug: 'a', title: 'A', contentMarkdown: '|a|b|\n|---|---|\n|1|2|', editorialDate: '2026-01-01' }], collections: [{ slug: 'series', items: [{ sourceId: 'b', slug: 'b', contentMarkdown: '```mermaid\ngraph TD\n A-->B\n```' }] }] };
  const next = structuredClone(base);
  const dates = Object.fromEntries(['a','b'].map((id) => [id, {route: id === 'a' ? 'posts/a' : 'series/b', publishedAt: '2026-01-01T00:00:00Z', displayPublishedAt: '2026-02-01T20:00:00+08:00', editedAt: null}]));
  applyPublicationDates(next, dates);
  assert.equal(next.posts[0].editorialDate, '2026-02-01T12:00:00.000Z');
  assert.equal(next.collections[0].items[0].updatedAt, null);
  assertDateOnlyChange(base, next);
  dates.a.displayPublishedAt = null;
  dates.a.editedAt = '2026-03-01T00:00:00Z';
  applyPublicationDates(next, dates);
  assert.equal(next.posts[0].editorialDate, '2026-01-01T00:00:00.000Z');
  assert.equal(next.posts[0].updatedAt, '2026-03-01T00:00:00.000Z');
  next.posts[0].contentMarkdown = 'private draft';
  assert.throws(() => assertDateOnlyChange(base, next), /changed article content/);
  assert.throws(() => applyPublicationDates(next, {a: {...dates.a, route:'posts/wrong'}}), /route mismatch/);
  assert.throws(() => applyPublicationDates(next, {a: {...dates.a, publishedAt:'invalid'}}), /Invalid publication date/);
});
test('snapshot save timestamp cannot replace publication or edit date', async () => {
 const prepared = await prepareSnapshot({publicationId:1,jobId:'test',manifest:{notes:[{id:'a',slug:'a',title:'A',body:'content',tags:[],topic_id:'tech',published_at:'2026-01-01T00:00:00Z',display_published_at:'2026-02-01T00:00:00Z',updated_at:'2026-11-01T00:00:00Z'}]}});
 assert.equal(prepared.posts[0].editorialDate,'2026-02-01T00:00:00Z');
 assert.equal(prepared.posts[0].publishedAt,'2026-01-01T00:00:00Z');
 assert.equal(prepared.posts[0].updatedAt,null);
});
