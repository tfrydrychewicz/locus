use rusqlite::Connection;
use std::path::PathBuf;
use std::sync::Mutex;

use crate::db::migration;

pub struct Database {
    conn: Mutex<Connection>,
}

impl Database {
    pub fn open(path: &PathBuf) -> Result<Self, rusqlite::Error> {
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent).ok();
        }

        let conn = Connection::open(path)?;
        Self::configure_pragmas(&conn)?;
        migration::run(&conn)?;

        Ok(Self {
            conn: Mutex::new(conn),
        })
    }

    pub fn open_in_memory() -> Result<Self, rusqlite::Error> {
        let conn = Connection::open_in_memory()?;
        Self::configure_pragmas(&conn)?;
        migration::run(&conn)?;

        Ok(Self {
            conn: Mutex::new(conn),
        })
    }

    fn configure_pragmas(conn: &Connection) -> Result<(), rusqlite::Error> {
        conn.execute_batch(
            "
            PRAGMA journal_mode = WAL;
            PRAGMA cache_size = -65536;
            PRAGMA mmap_size = 1073741824;
            PRAGMA page_size = 8192;
            PRAGMA synchronous = NORMAL;
            PRAGMA temp_store = MEMORY;
            PRAGMA foreign_keys = ON;
            ",
        )
    }

    pub fn with_conn<F, R>(&self, f: F) -> Result<R, rusqlite::Error>
    where
        F: FnOnce(&Connection) -> Result<R, rusqlite::Error>,
    {
        let conn = self.conn.lock().expect("database lock poisoned");
        f(&conn)
    }

    pub fn optimize(&self) -> Result<(), rusqlite::Error> {
        self.with_conn(|conn| conn.execute_batch("PRAGMA optimize;"))
    }
}

impl Drop for Database {
    fn drop(&mut self) {
        if let Ok(conn) = self.conn.lock() {
            conn.execute_batch("PRAGMA optimize;").ok();
        }
    }
}
