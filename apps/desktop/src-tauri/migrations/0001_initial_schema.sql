-- Count cache for fast aggregate queries at scale
CREATE TABLE IF NOT EXISTS count_cache (
    table_name TEXT PRIMARY KEY,
    row_count  INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Initialize count_cache entries for known tables
INSERT OR IGNORE INTO count_cache (table_name, row_count) VALUES ('notes', 0);
INSERT OR IGNORE INTO count_cache (table_name, row_count) VALUES ('tasks', 0);
INSERT OR IGNORE INTO count_cache (table_name, row_count) VALUES ('entities', 0);
INSERT OR IGNORE INTO count_cache (table_name, row_count) VALUES ('calendar_events', 0);

-- App settings key-value store
CREATE TABLE IF NOT EXISTS settings (
    key       TEXT PRIMARY KEY,
    value     TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
