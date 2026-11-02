-- Editorial display dates are independent of save/audit timestamps.
ALTER TABLE notes ADD COLUMN display_published_at TEXT;
ALTER TABLE notes ADD COLUMN content_updated_at TEXT;

DROP TRIGGER note_insert;
DROP TRIGGER note_update;
CREATE TRIGGER note_insert AFTER INSERT ON notes BEGIN
 INSERT INTO revisions VALUES(NEW.id,NEW.version,json_object('id',NEW.id,'slug',NEW.slug,'title',NEW.title,'body',NEW.body,'topic_id',NEW.topic_id,'state',NEW.state,'visibility',NEW.visibility,'tags',NEW.tags,'version',NEW.version,'updated_at',NEW.updated_at,'display_published_at',NEW.display_published_at,'content_updated_at',NEW.content_updated_at),NEW.updated_at);
 INSERT INTO mutations VALUES(NEW.mutation_id,NEW.id,NEW.mutation_hash,NEW.version);
 UPDATE settings SET corpus_revision=corpus_revision+1 WHERE id=1;
END;
CREATE TRIGGER note_update AFTER UPDATE ON notes BEGIN
 INSERT INTO revisions VALUES(NEW.id,NEW.version,json_object('id',NEW.id,'slug',NEW.slug,'title',NEW.title,'body',NEW.body,'topic_id',NEW.topic_id,'state',NEW.state,'visibility',NEW.visibility,'tags',NEW.tags,'version',NEW.version,'updated_at',NEW.updated_at,'display_published_at',NEW.display_published_at,'content_updated_at',NEW.content_updated_at),NEW.updated_at);
 INSERT INTO mutations VALUES(NEW.mutation_id,NEW.id,NEW.mutation_hash,NEW.version);
 UPDATE settings SET corpus_revision=corpus_revision+1 WHERE id=1;
END;
