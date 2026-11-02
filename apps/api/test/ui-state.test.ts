import { test } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeDisplayDate,
  fromDisplayInput,
} from "../../knowledge/src/dates";
import { visibleLocalDrafts, type Draft } from "../../knowledge/src/drafts";
import type { Note } from "../../knowledge/src/types";
test("display date rejects rollovers and preserves exact UTC+8", () => {
  for (const input of [
    "2026-02-29 12:00",
    "2026-04-31 00:00",
    "2026-12-18 24:00",
    "2026-12-18 10:60",
    "invalid",
  ])
    assert.equal(normalizeDisplayDate(input), null, input);
  assert.equal(normalizeDisplayDate("2024/02/29 10:24"), "2024-02-29T10:24");
  assert.equal(
    fromDisplayInput(normalizeDisplayDate("2024/02/29 10:24")!),
    "2024-02-29T02:24:00.000Z",
  );
});
test("server tombstones suppress cached drafts without destroying recovery data", () => {
  const note = (id: string) =>
    ({ id, deleted_at: null, version: 1, body: "本机未提交正文" }) as Note;
  const drafts = ["deleted", "active", "local-new"].map(
    (id) => ({ note: note(id), baseVersion: 1, updatedAt: 1 }) as Draft,
  );
  assert.deepEqual(
    visibleLocalDrafts(drafts, [note("active")], ["deleted"]).map((n) => n.id),
    ["local-new"],
  );
  assert.equal(drafts[0].note.body, "本机未提交正文");
  assert.deepEqual(
    visibleLocalDrafts(drafts, [note("active"), note("deleted")], []).map(
      (n) => n.id,
    ),
    ["local-new"],
  );
});
