CREATE TABLE IF NOT EXISTS build_jobs (
 id TEXT PRIMARY KEY,
 publication_id INTEGER NOT NULL REFERENCES publications(id),
 status TEXT NOT NULL CHECK(status IN ('dispatching','queued','building','deploying','succeeded','failed')),
 created_at TEXT NOT NULL,
 updated_at TEXT NOT NULL,
 run_id TEXT,
 detail TEXT NOT NULL DEFAULT '',
 site_url TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS one_active_build ON build_jobs((1)) WHERE status IN ('dispatching','queued','building','deploying');
CREATE INDEX IF NOT EXISTS build_publication ON build_jobs(publication_id,created_at);
