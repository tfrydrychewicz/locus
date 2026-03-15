-- Notes table
CREATE TABLE notes (
    id             TEXT PRIMARY KEY,
    title          TEXT NOT NULL DEFAULT 'Untitled',
    body           TEXT NOT NULL DEFAULT '',
    body_plain     TEXT NOT NULL DEFAULT '',
    template_id    TEXT,
    embedding_dirty INTEGER NOT NULL DEFAULT 1,
    created_at     TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at     TEXT NOT NULL DEFAULT (datetime('now')),
    archived_at    TEXT
);

-- FTS5 virtual table for full-text search (content-sync with notes)
CREATE VIRTUAL TABLE notes_fts USING fts5(
    title, body_plain,
    content='notes', content_rowid='rowid',
    tokenize='unicode61'
);

-- Triggers to keep FTS index in sync with notes table
CREATE TRIGGER notes_fts_insert AFTER INSERT ON notes BEGIN
    INSERT INTO notes_fts(rowid, title, body_plain)
    VALUES (new.rowid, new.title, new.body_plain);
END;

CREATE TRIGGER notes_fts_update AFTER UPDATE ON notes BEGIN
    INSERT INTO notes_fts(notes_fts, rowid, title, body_plain)
    VALUES ('delete', old.rowid, old.title, old.body_plain);
    INSERT INTO notes_fts(rowid, title, body_plain)
    VALUES (new.rowid, new.title, new.body_plain);
END;

CREATE TRIGGER notes_fts_delete AFTER DELETE ON notes BEGIN
    INSERT INTO notes_fts(notes_fts, rowid, title, body_plain)
    VALUES ('delete', old.rowid, old.title, old.body_plain);
END;

-- Count cache triggers for notes
CREATE TRIGGER notes_count_insert AFTER INSERT ON notes
WHEN new.archived_at IS NULL
BEGIN
    UPDATE count_cache
    SET row_count = row_count + 1, updated_at = datetime('now')
    WHERE table_name = 'notes';
END;

CREATE TRIGGER notes_count_delete AFTER DELETE ON notes
WHEN old.archived_at IS NULL
BEGIN
    UPDATE count_cache
    SET row_count = MAX(row_count - 1, 0), updated_at = datetime('now')
    WHERE table_name = 'notes';
END;

CREATE TRIGGER notes_count_archive AFTER UPDATE OF archived_at ON notes
WHEN old.archived_at IS NULL AND new.archived_at IS NOT NULL
BEGIN
    UPDATE count_cache
    SET row_count = MAX(row_count - 1, 0), updated_at = datetime('now')
    WHERE table_name = 'notes';
END;

CREATE TRIGGER notes_count_unarchive AFTER UPDATE OF archived_at ON notes
WHEN old.archived_at IS NOT NULL AND new.archived_at IS NULL
BEGIN
    UPDATE count_cache
    SET row_count = row_count + 1, updated_at = datetime('now')
    WHERE table_name = 'notes';
END;

-- Indexes for million-note scale
CREATE INDEX idx_notes_updated ON notes(updated_at DESC)
    WHERE archived_at IS NULL;
CREATE INDEX idx_notes_archived ON notes(archived_at)
    WHERE archived_at IS NOT NULL;
CREATE INDEX idx_notes_template ON notes(template_id)
    WHERE template_id IS NOT NULL;
CREATE INDEX idx_notes_embedding_dirty ON notes(id)
    WHERE embedding_dirty = 1;
