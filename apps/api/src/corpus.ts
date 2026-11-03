import type { Bindings, Note } from "./types";

export const CORPUS_PAGE_BYTES = 256 * 1024;
const PAGE_ITEMS = 30;
// Match SELECT * below, including import metadata and JSON escaping. D1 returns
// only the size here; large bodies never enter the Worker just as lookahead.
const noteFields = [
  "id", "slug", "title", "body", "topic_id", "state", "visibility", "tags",
  "version", "updated_at", "deleted_at", "mutation_id", "mutation_hash",
  "source_path", "source_metadata", "display_published_at", "content_updated_at",
];
const noteJson = `json_object(${noteFields.map((field) => `'${field}',${field}`).join(",")})`;

export async function corpusPage(env: Bindings, cursor: string) {
  const candidates = await env.DB.prepare(
    `SELECT id,length(CAST(${noteJson} AS BLOB)) AS bytes
    FROM notes WHERE deleted_at IS NULL AND id>? ORDER BY id LIMIT ?`,
  ).bind(cursor, PAGE_ITEMS + 1).all<{ id: string; bytes: number }>();

  let count = 0;
  let bytes = 2; // JSON array brackets.
  for (const candidate of candidates.results.slice(0, PAGE_ITEMS)) {
    const added = candidate.bytes + (count ? 1 : 0);
    // An oversized historical note travels alone so the cursor always advances.
    if (count && bytes + added > CORPUS_PAGE_BYTES) break;
    bytes += added;
    count++;
  }
  if (!count) return { data: [] as Note[], nextCursor: null };

  const lastId = candidates.results[count - 1].id;
  const notes = await env.DB.prepare(
    "SELECT * FROM notes WHERE deleted_at IS NULL AND id>? AND id<=? ORDER BY id",
  ).bind(cursor, lastId).all<Note>();
  return {
    data: notes.results,
    nextCursor: candidates.results.length > count ? lastId : null,
  };
}
