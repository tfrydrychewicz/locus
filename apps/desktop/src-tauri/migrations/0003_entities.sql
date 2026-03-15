-- ── entity_types ─────────────────────────────────────────────────────────────
CREATE TABLE entity_types (
    id          TEXT PRIMARY KEY,
    slug        TEXT NOT NULL UNIQUE,
    name        TEXT NOT NULL,
    icon        TEXT,
    color       TEXT,
    fields      TEXT NOT NULL DEFAULT '[]', -- JSON array of FieldDefinition
    is_built_in INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
    trashed_at  TEXT
);

CREATE INDEX idx_entity_types_updated ON entity_types(updated_at DESC)
    WHERE trashed_at IS NULL;
CREATE INDEX idx_entity_types_trashed ON entity_types(trashed_at)
    WHERE trashed_at IS NOT NULL;

-- ── entities ─────────────────────────────────────────────────────────────────
CREATE TABLE entities (
    id               TEXT PRIMARY KEY,
    entity_type_id   TEXT NOT NULL REFERENCES entity_types(id),
    entity_type_slug TEXT NOT NULL,
    name             TEXT NOT NULL,
    fields           TEXT NOT NULL DEFAULT '{}', -- JSON object of field values
    created_at       TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at       TEXT NOT NULL DEFAULT (datetime('now')),
    trashed_at       TEXT
);

-- FTS5 for entity name search
CREATE VIRTUAL TABLE entities_fts USING fts5(
    name,
    content='entities', content_rowid='rowid',
    tokenize='unicode61'
);

-- FTS sync triggers
CREATE TRIGGER entities_fts_insert AFTER INSERT ON entities BEGIN
    INSERT INTO entities_fts(rowid, name) VALUES (new.rowid, new.name);
END;

CREATE TRIGGER entities_fts_update AFTER UPDATE ON entities BEGIN
    INSERT INTO entities_fts(entities_fts, rowid, name)
    VALUES ('delete', old.rowid, old.name);
    INSERT INTO entities_fts(rowid, name) VALUES (new.rowid, new.name);
END;

CREATE TRIGGER entities_fts_delete AFTER DELETE ON entities BEGIN
    INSERT INTO entities_fts(entities_fts, rowid, name)
    VALUES ('delete', old.rowid, old.name);
END;

-- Count cache triggers for active (non-trashed) entities
CREATE TRIGGER entities_count_insert AFTER INSERT ON entities
WHEN new.trashed_at IS NULL
BEGIN
    UPDATE count_cache
    SET row_count = row_count + 1, updated_at = datetime('now')
    WHERE table_name = 'entities';
END;

CREATE TRIGGER entities_count_delete AFTER DELETE ON entities
WHEN old.trashed_at IS NULL
BEGIN
    UPDATE count_cache
    SET row_count = MAX(row_count - 1, 0), updated_at = datetime('now')
    WHERE table_name = 'entities';
END;

CREATE TRIGGER entities_count_trash AFTER UPDATE OF trashed_at ON entities
WHEN old.trashed_at IS NULL AND new.trashed_at IS NOT NULL
BEGIN
    UPDATE count_cache
    SET row_count = MAX(row_count - 1, 0), updated_at = datetime('now')
    WHERE table_name = 'entities';
END;

CREATE TRIGGER entities_count_restore AFTER UPDATE OF trashed_at ON entities
WHEN old.trashed_at IS NOT NULL AND new.trashed_at IS NULL
BEGIN
    UPDATE count_cache
    SET row_count = row_count + 1, updated_at = datetime('now')
    WHERE table_name = 'entities';
END;

-- Indexes for million-entity scale
CREATE INDEX idx_entities_type ON entities(entity_type_id)
    WHERE trashed_at IS NULL;
CREATE INDEX idx_entities_slug ON entities(entity_type_slug)
    WHERE trashed_at IS NULL;
CREATE INDEX idx_entities_updated ON entities(updated_at DESC)
    WHERE trashed_at IS NULL;
CREATE INDEX idx_entities_trashed ON entities(trashed_at)
    WHERE trashed_at IS NOT NULL;

-- ── entity_mentions ───────────────────────────────────────────────────────────
CREATE TABLE entity_mentions (
    id           TEXT PRIMARY KEY,
    note_id      TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    entity_id    TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
    mention_type TEXT NOT NULL DEFAULT 'inline', -- 'inline' | 'property'
    offset       INTEGER,
    created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_entity_mentions_note   ON entity_mentions(note_id);
CREATE INDEX idx_entity_mentions_entity ON entity_mentions(entity_id);

-- ── note_relations ────────────────────────────────────────────────────────────
CREATE TABLE note_relations (
    id            TEXT PRIMARY KEY,
    from_note_id  TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    to_note_id    TEXT NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    relation_type TEXT NOT NULL DEFAULT 'link', -- 'link' | 'embed' | 'reference'
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_note_relations_from ON note_relations(from_note_id);
CREATE INDEX idx_note_relations_to   ON note_relations(to_note_id);

-- ── Seed built-in entity types ────────────────────────────────────────────────
-- IDs use fixed ULID-format strings (valid Crockford base32, 26 chars)
INSERT INTO entity_types (id, slug, name, icon, color, fields, is_built_in) VALUES
    ('01J00000000000000000000001', 'person',   'Person',   'user',   '#3b82f6', '[]', 1),
    ('01J00000000000000000000002', 'project',  'Project',  'folder', '#8b5cf6', '[]', 1),
    ('01J00000000000000000000003', 'team',     'Team',     'users',  '#10b981', '[]', 1),
    ('01J00000000000000000000004', 'decision', 'Decision', 'scale',  '#f59e0b', '[]', 1),
    ('01J00000000000000000000005', 'okr',      'OKR',      'target', '#ef4444', '[]', 1);
