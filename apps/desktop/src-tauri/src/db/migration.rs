use rusqlite::Connection;

struct Migration {
    version: u32,
    name: &'static str,
    sql: &'static str,
}

const MIGRATIONS: &[Migration] = &[
    Migration {
        version: 1,
        name: "initial_schema",
        sql: include_str!("../../migrations/0001_initial_schema.sql"),
    },
    Migration {
        version: 2,
        name: "notes",
        sql: include_str!("../../migrations/0002_notes.sql"),
    },
    Migration {
        version: 3,
        name: "entities",
        sql: include_str!("../../migrations/0003_entities.sql"),
    },
    Migration {
        version: 4,
        name: "entity_type_icons",
        sql: include_str!("../../migrations/0004_entity_type_icons.sql"),
    },
];

pub fn run(conn: &Connection) -> Result<(), rusqlite::Error> {
    conn.execute_batch(
        "CREATE TABLE IF NOT EXISTS _migrations (
            version INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            applied_at TEXT NOT NULL DEFAULT (datetime('now'))
        )",
    )?;

    let current_version: u32 = conn
        .query_row(
            "SELECT COALESCE(MAX(version), 0) FROM _migrations",
            [],
            |row| row.get(0),
        )
        .unwrap_or(0);

    for migration in MIGRATIONS {
        if migration.version > current_version {
            log::info!(
                "Applying migration {}: {}",
                migration.version,
                migration.name
            );
            conn.execute_batch(migration.sql)?;
            conn.execute(
                "INSERT INTO _migrations (version, name) VALUES (?1, ?2)",
                rusqlite::params![migration.version, migration.name],
            )?;
        }
    }

    Ok(())
}
