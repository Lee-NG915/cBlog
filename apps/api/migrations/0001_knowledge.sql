PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY CHECK(id=1), corpus_revision INTEGER NOT NULL DEFAULT 0);
INSERT OR IGNORE INTO settings(id) VALUES(1);
CREATE TABLE IF NOT EXISTS groups (id TEXT PRIMARY KEY, name TEXT NOT NULL, kind TEXT NOT NULL CHECK(kind IN ('domain','topic','path','project')), parent_id TEXT REFERENCES groups(id), position INTEGER NOT NULL DEFAULT 0, version INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS notes (id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, title TEXT NOT NULL, body TEXT NOT NULL DEFAULT '', topic_id TEXT REFERENCES groups(id), state TEXT NOT NULL DEFAULT 'draft' CHECK(state IN ('draft','ready','archived')), visibility TEXT NOT NULL DEFAULT 'owner' CHECK(visibility IN ('owner','public')), tags TEXT NOT NULL DEFAULT '[]', version INTEGER NOT NULL DEFAULT 1, updated_at TEXT NOT NULL, deleted_at TEXT, mutation_id TEXT NOT NULL, mutation_hash TEXT NOT NULL, source_path TEXT UNIQUE);
CREATE INDEX IF NOT EXISTS notes_topic ON notes(topic_id,updated_at,id);
CREATE INDEX IF NOT EXISTS notes_updated ON notes(deleted_at,updated_at,id);
CREATE TABLE IF NOT EXISTS memberships (group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE, note_id TEXT NOT NULL REFERENCES notes(id), position INTEGER NOT NULL, PRIMARY KEY(group_id,note_id));
CREATE TABLE IF NOT EXISTS revisions(note_id TEXT NOT NULL REFERENCES notes(id), version INTEGER NOT NULL, snapshot TEXT NOT NULL, created_at TEXT NOT NULL, PRIMARY KEY(note_id,version));
CREATE TABLE IF NOT EXISTS mutations(id TEXT PRIMARY KEY, note_id TEXT NOT NULL, payload_hash TEXT NOT NULL, version INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS assets(id TEXT PRIMARY KEY, mime TEXT NOT NULL, bytes INTEGER NOT NULL, state TEXT NOT NULL CHECK(state IN ('pending','ready')), created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS publications(id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT NOT NULL, manifest TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'snapshot' CHECK(status IN ('snapshot','deployed','failed')));
CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY, csrf TEXT NOT NULL, expires_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS usage(feature TEXT NOT NULL, day TEXT NOT NULL, count INTEGER NOT NULL, PRIMARY KEY(feature,day));
CREATE TRIGGER IF NOT EXISTS note_insert AFTER INSERT ON notes BEGIN
 INSERT INTO revisions VALUES(NEW.id,NEW.version,json_object('id',NEW.id,'slug',NEW.slug,'title',NEW.title,'body',NEW.body,'topic_id',NEW.topic_id,'state',NEW.state,'visibility',NEW.visibility,'tags',NEW.tags,'version',NEW.version,'updated_at',NEW.updated_at),NEW.updated_at);
 INSERT INTO mutations VALUES(NEW.mutation_id,NEW.id,NEW.mutation_hash,NEW.version);
 UPDATE settings SET corpus_revision=corpus_revision+1 WHERE id=1;
END;
CREATE TRIGGER IF NOT EXISTS note_update AFTER UPDATE ON notes BEGIN
 INSERT INTO revisions VALUES(NEW.id,NEW.version,json_object('id',NEW.id,'slug',NEW.slug,'title',NEW.title,'body',NEW.body,'topic_id',NEW.topic_id,'state',NEW.state,'visibility',NEW.visibility,'tags',NEW.tags,'version',NEW.version,'updated_at',NEW.updated_at),NEW.updated_at);
 INSERT INTO mutations VALUES(NEW.mutation_id,NEW.id,NEW.mutation_hash,NEW.version);
 UPDATE settings SET corpus_revision=corpus_revision+1 WHERE id=1;
END;
CREATE TRIGGER IF NOT EXISTS groups_insert AFTER INSERT ON groups BEGIN UPDATE settings SET corpus_revision=corpus_revision+1 WHERE id=1; END;
CREATE TRIGGER IF NOT EXISTS groups_update AFTER UPDATE ON groups BEGIN UPDATE settings SET corpus_revision=corpus_revision+1 WHERE id=1; END;
CREATE TRIGGER IF NOT EXISTS members_insert AFTER INSERT ON memberships BEGIN UPDATE settings SET corpus_revision=corpus_revision+1 WHERE id=1; END;
CREATE TRIGGER IF NOT EXISTS members_delete AFTER DELETE ON memberships BEGIN UPDATE settings SET corpus_revision=corpus_revision+1 WHERE id=1; END;
CREATE TABLE IF NOT EXISTS group_locks(id TEXT PRIMARY KEY REFERENCES groups(id) ON DELETE CASCADE,marker TEXT NOT NULL);

CREATE TRIGGER IF NOT EXISTS groups_delete AFTER DELETE ON groups BEGIN UPDATE settings SET corpus_revision=corpus_revision+1 WHERE id=1; END;
