use serde::Serialize;
use tauri::State;

use crate::db::Database;

#[derive(Debug, Serialize)]
pub struct DbStatus {
    pub version: u32,
    pub page_size: u32,
    pub wal_mode: bool,
    pub cache_size: i64,
    pub mmap_size: i64,
    pub table_count: u32,
}

#[derive(Debug, Serialize, thiserror::Error)]
pub enum CommandError {
    #[error("Database error: {0}")]
    Database(String),
    #[error("Not found: {0}")]
    NotFound(String),
    #[error("Validation error: {0}")]
    Validation(String),
}

impl From<rusqlite::Error> for CommandError {
    fn from(e: rusqlite::Error) -> Self {
        CommandError::Database(e.to_string())
    }
}

#[tauri::command]
pub fn ping() -> String {
    "pong".to_string()
}

#[tauri::command]
pub fn get_db_status(db: State<'_, Database>) -> Result<DbStatus, CommandError> {
    db.with_conn(|conn| {
        let version: u32 = conn.query_row(
            "SELECT COALESCE(MAX(version), 0) FROM _migrations",
            [],
            |row| row.get(0),
        )?;

        let page_size: u32 = conn.pragma_query_value(None, "page_size", |row| row.get(0))?;

        let journal_mode: String =
            conn.pragma_query_value(None, "journal_mode", |row| row.get(0))?;

        let cache_size: i64 = conn.pragma_query_value(None, "cache_size", |row| row.get(0))?;

        let mmap_size: i64 = conn.pragma_query_value(None, "mmap_size", |row| row.get(0))?;

        let table_count: u32 = conn.query_row(
            "SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'",
            [],
            |row| row.get(0),
        )?;

        Ok(DbStatus {
            version,
            page_size,
            wal_mode: journal_mode.eq_ignore_ascii_case("wal"),
            cache_size,
            mmap_size,
            table_count,
        })
    })
    .map_err(CommandError::from)
}
