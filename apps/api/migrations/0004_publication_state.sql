-- Verified public inventory is independent of an author's working draft.
CREATE TABLE IF NOT EXISTS live_site (
 id INTEGER PRIMARY KEY CHECK(id=1),
 job_id TEXT NOT NULL,
 publication_id INTEGER NOT NULL,
 notes TEXT NOT NULL,
 verified_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS publication_request ON publications(json_extract(manifest,'$.requestId'))
 WHERE json_extract(manifest,'$.requestId') IS NOT NULL;
