-- Blog publication collections are separate from private projects/learning paths.
CREATE TABLE IF NOT EXISTS blog_collections (
 slug TEXT PRIMARY KEY,
 name TEXT NOT NULL,
 description TEXT NOT NULL DEFAULT '',
 position INTEGER NOT NULL DEFAULT 0,
 members TEXT NOT NULL DEFAULT '[]'
);
