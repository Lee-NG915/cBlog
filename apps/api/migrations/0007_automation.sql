-- Only notes explicitly created by the draft automation API may be updated by it.
-- A source binding survives trash/archive and must never claim an ordinary note.
CREATE TABLE IF NOT EXISTS automation_sources (
 source_key TEXT PRIMARY KEY,
 note_id TEXT NOT NULL UNIQUE REFERENCES notes(id),
 created_at TEXT NOT NULL
);

-- A draft token cannot enumerate or fetch pre-existing private attachments.
-- Uploading the exact bytes explicitly registers a content-addressed asset.
CREATE TABLE IF NOT EXISTS automation_assets (
 asset_id TEXT PRIMARY KEY REFERENCES assets(id),
 created_at TEXT NOT NULL
);
