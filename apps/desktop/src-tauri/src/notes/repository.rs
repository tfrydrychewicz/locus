use rusqlite::{params, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};

use crate::db::pagination::{decode_cursor, encode_cursor, Page, PaginationParams};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Note {
    pub id: String,
    pub title: String,
    pub body: String,
    pub body_plain: String,
    pub template_id: Option<String>,
    pub embedding_dirty: bool,
    pub created_at: String,
    pub updated_at: String,
    pub archived_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NoteSearchResult {
    pub note: Note,
    pub rank: f64,
    pub snippet: Option<String>,
}

#[derive(Debug, Clone, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct NoteFilter {
    pub archived: Option<bool>,
    pub created_after: Option<String>,
    pub created_before: Option<String>,
    pub updated_after: Option<String>,
    pub updated_before: Option<String>,
    pub template_id: Option<String>,
}

fn row_to_note(row: &rusqlite::Row<'_>) -> rusqlite::Result<Note> {
    Ok(Note {
        id: row.get("id")?,
        title: row.get("title")?,
        body: row.get("body")?,
        body_plain: row.get("body_plain")?,
        template_id: row.get("template_id")?,
        embedding_dirty: row.get::<_, i32>("embedding_dirty")? != 0,
        created_at: row.get("created_at")?,
        updated_at: row.get("updated_at")?,
        archived_at: row.get("archived_at")?,
    })
}

pub fn find_by_id(conn: &Connection, id: &str) -> rusqlite::Result<Option<Note>> {
    conn.query_row(
        "SELECT id, title, body, body_plain, template_id, embedding_dirty,
                created_at, updated_at, archived_at
         FROM notes WHERE id = ?1",
        params![id],
        row_to_note,
    )
    .optional()
}

pub fn find_all(
    conn: &Connection,
    filter: &NoteFilter,
    page: &PaginationParams,
) -> rusqlite::Result<Page<Note>> {
    let limit = page.effective_limit();
    let fetch_limit = limit + 1;

    let mut conditions = Vec::new();
    let mut bind_values: Vec<Box<dyn rusqlite::types::ToSql>> = Vec::new();

    match filter.archived {
        Some(true) => conditions.push("archived_at IS NOT NULL".to_string()),
        Some(false) | None => conditions.push("archived_at IS NULL".to_string()),
    }

    if let Some(ref v) = filter.created_after {
        bind_values.push(Box::new(v.clone()));
        conditions.push(format!("created_at > ?{}", bind_values.len()));
    }
    if let Some(ref v) = filter.created_before {
        bind_values.push(Box::new(v.clone()));
        conditions.push(format!("created_at < ?{}", bind_values.len()));
    }
    if let Some(ref v) = filter.updated_after {
        bind_values.push(Box::new(v.clone()));
        conditions.push(format!("updated_at > ?{}", bind_values.len()));
    }
    if let Some(ref v) = filter.updated_before {
        bind_values.push(Box::new(v.clone()));
        conditions.push(format!("updated_at < ?{}", bind_values.len()));
    }
    if let Some(ref v) = filter.template_id {
        bind_values.push(Box::new(v.clone()));
        conditions.push(format!("template_id = ?{}", bind_values.len()));
    }

    if let Some(ref cursor_str) = page.cursor {
        if let Some((sort_key, cursor_id)) = decode_cursor(cursor_str) {
            bind_values.push(Box::new(sort_key.clone()));
            let sort_idx = bind_values.len();
            bind_values.push(Box::new(cursor_id.clone()));
            let id_idx = bind_values.len();
            conditions.push(format!(
                "(updated_at < ?{} OR (updated_at = ?{} AND id < ?{}))",
                sort_idx, sort_idx, id_idx
            ));
        }
    }

    let where_clause = if conditions.is_empty() {
        String::new()
    } else {
        format!("WHERE {}", conditions.join(" AND "))
    };

    bind_values.push(Box::new(fetch_limit));
    let limit_idx = bind_values.len();

    let sql = format!(
        "SELECT id, title, body, body_plain, template_id, embedding_dirty,
                created_at, updated_at, archived_at
         FROM notes
         {}
         ORDER BY updated_at DESC, id DESC
         LIMIT ?{}",
        where_clause, limit_idx
    );

    let refs: Vec<&dyn rusqlite::types::ToSql> = bind_values.iter().map(|b| b.as_ref()).collect();
    let mut stmt = conn.prepare(&sql)?;
    let rows: Vec<Note> = stmt
        .query_map(refs.as_slice(), row_to_note)?
        .collect::<rusqlite::Result<Vec<_>>>()?;

    let has_more = rows.len() > limit as usize;
    let items: Vec<Note> = rows.into_iter().take(limit as usize).collect();

    let cursor = items
        .last()
        .map(|n| encode_cursor(&n.updated_at, &n.id));

    let total_estimate: u64 = conn
        .query_row(
            "SELECT row_count FROM count_cache WHERE table_name = 'notes'",
            [],
            |row| row.get(0),
        )
        .unwrap_or(0);

    Ok(Page {
        items,
        cursor,
        has_more,
        total_estimate,
    })
}

pub fn insert(conn: &Connection, note: &Note) -> rusqlite::Result<()> {
    conn.execute(
        "INSERT INTO notes (id, title, body, body_plain, template_id, embedding_dirty,
                            created_at, updated_at, archived_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
        params![
            note.id,
            note.title,
            note.body,
            note.body_plain,
            note.template_id,
            note.embedding_dirty as i32,
            note.created_at,
            note.updated_at,
            note.archived_at,
        ],
    )?;
    Ok(())
}

pub fn update(conn: &Connection, note: &Note) -> rusqlite::Result<()> {
    conn.execute(
        "UPDATE notes SET title = ?1, body = ?2, body_plain = ?3, template_id = ?4,
                          embedding_dirty = ?5, updated_at = ?6, archived_at = ?7
         WHERE id = ?8",
        params![
            note.title,
            note.body,
            note.body_plain,
            note.template_id,
            note.embedding_dirty as i32,
            note.updated_at,
            note.archived_at,
            note.id,
        ],
    )?;
    Ok(())
}

pub fn soft_delete(conn: &Connection, id: &str) -> rusqlite::Result<()> {
    conn.execute(
        "UPDATE notes SET archived_at = datetime('now'), updated_at = datetime('now')
         WHERE id = ?1 AND archived_at IS NULL",
        params![id],
    )?;
    Ok(())
}

pub fn hard_delete(conn: &Connection, id: &str) -> rusqlite::Result<()> {
    conn.execute("DELETE FROM notes WHERE id = ?1", params![id])?;
    Ok(())
}

pub fn search_fts(
    conn: &Connection,
    query: &str,
    limit: u32,
) -> rusqlite::Result<Vec<NoteSearchResult>> {
    let effective_limit = limit.min(50);
    let mut stmt = conn.prepare(
        "SELECT n.id, n.title, n.body, n.body_plain, n.template_id, n.embedding_dirty,
                n.created_at, n.updated_at, n.archived_at,
                fts.rank,
                snippet(notes_fts, 1, '<mark>', '</mark>', '…', 40) AS snippet
         FROM notes_fts fts
         JOIN notes n ON n.rowid = fts.rowid
         WHERE notes_fts MATCH ?1
         ORDER BY fts.rank
         LIMIT ?2",
    )?;

    let results = stmt
        .query_map(params![query, effective_limit], |row| {
            let note = Note {
                id: row.get("id")?,
                title: row.get("title")?,
                body: row.get("body")?,
                body_plain: row.get("body_plain")?,
                template_id: row.get("template_id")?,
                embedding_dirty: row.get::<_, i32>("embedding_dirty")? != 0,
                created_at: row.get("created_at")?,
                updated_at: row.get("updated_at")?,
                archived_at: row.get("archived_at")?,
            };
            let rank: f64 = row.get("rank")?;
            let snippet: Option<String> = row.get("snippet")?;
            Ok(NoteSearchResult {
                note,
                rank,
                snippet,
            })
        })?
        .collect::<rusqlite::Result<Vec<_>>>()?;

    Ok(results)
}

pub fn count_by_filter(conn: &Connection, filter: &NoteFilter) -> rusqlite::Result<u64> {
    if filter.created_after.is_none()
        && filter.created_before.is_none()
        && filter.updated_after.is_none()
        && filter.updated_before.is_none()
        && filter.template_id.is_none()
    {
        let is_archived = filter.archived.unwrap_or(false);
        if !is_archived {
            return conn
                .query_row(
                    "SELECT row_count FROM count_cache WHERE table_name = 'notes'",
                    [],
                    |row| row.get(0),
                )
                .or(Ok(0));
        }
    }

    let mut conditions = Vec::new();
    let mut bind_values: Vec<Box<dyn rusqlite::types::ToSql>> = Vec::new();

    match filter.archived {
        Some(true) => conditions.push("archived_at IS NOT NULL".to_string()),
        Some(false) | None => conditions.push("archived_at IS NULL".to_string()),
    }

    if let Some(ref v) = filter.created_after {
        bind_values.push(Box::new(v.clone()));
        conditions.push(format!("created_at > ?{}", bind_values.len()));
    }
    if let Some(ref v) = filter.created_before {
        bind_values.push(Box::new(v.clone()));
        conditions.push(format!("created_at < ?{}", bind_values.len()));
    }
    if let Some(ref v) = filter.updated_after {
        bind_values.push(Box::new(v.clone()));
        conditions.push(format!("updated_at > ?{}", bind_values.len()));
    }
    if let Some(ref v) = filter.updated_before {
        bind_values.push(Box::new(v.clone()));
        conditions.push(format!("updated_at < ?{}", bind_values.len()));
    }
    if let Some(ref v) = filter.template_id {
        bind_values.push(Box::new(v.clone()));
        conditions.push(format!("template_id = ?{}", bind_values.len()));
    }

    let where_clause = if conditions.is_empty() {
        String::new()
    } else {
        format!("WHERE {}", conditions.join(" AND "))
    };

    let sql = format!("SELECT COUNT(*) FROM notes {}", where_clause);

    let refs: Vec<&dyn rusqlite::types::ToSql> = bind_values.iter().map(|b| b.as_ref()).collect();
    conn.query_row(&sql, refs.as_slice(), |row| row.get(0))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::Database;

    fn setup() -> Database {
        Database::open_in_memory().expect("failed to open in-memory db")
    }

    fn make_note(id: &str, title: &str) -> Note {
        Note {
            id: id.to_string(),
            title: title.to_string(),
            body: String::new(),
            body_plain: title.to_lowercase(),
            template_id: None,
            embedding_dirty: true,
            created_at: "2025-06-15T10:00:00".to_string(),
            updated_at: "2025-06-15T10:00:00".to_string(),
            archived_at: None,
        }
    }

    #[test]
    fn test_insert_and_find() {
        let db = setup();
        db.with_conn(|conn| {
            let note = make_note("note_001", "Hello World");
            insert(conn, &note)?;
            let found = find_by_id(conn, "note_001")?;
            assert!(found.is_some());
            assert_eq!(found.unwrap().title, "Hello World");
            Ok(())
        })
        .unwrap();
    }

    #[test]
    fn test_find_not_found() {
        let db = setup();
        db.with_conn(|conn| {
            let found = find_by_id(conn, "nonexistent")?;
            assert!(found.is_none());
            Ok(())
        })
        .unwrap();
    }

    #[test]
    fn test_update_note() {
        let db = setup();
        db.with_conn(|conn| {
            let mut note = make_note("note_002", "Before");
            insert(conn, &note)?;
            note.title = "After".to_string();
            note.body_plain = "after".to_string();
            update(conn, &note)?;
            let found = find_by_id(conn, "note_002")?.unwrap();
            assert_eq!(found.title, "After");
            Ok(())
        })
        .unwrap();
    }

    #[test]
    fn test_soft_delete() {
        let db = setup();
        db.with_conn(|conn| {
            let note = make_note("note_003", "To Archive");
            insert(conn, &note)?;
            soft_delete(conn, "note_003")?;
            let found = find_by_id(conn, "note_003")?.unwrap();
            assert!(found.archived_at.is_some());
            Ok(())
        })
        .unwrap();
    }

    #[test]
    fn test_hard_delete() {
        let db = setup();
        db.with_conn(|conn| {
            let note = make_note("note_004", "To Delete");
            insert(conn, &note)?;
            hard_delete(conn, "note_004")?;
            let found = find_by_id(conn, "note_004")?;
            assert!(found.is_none());
            Ok(())
        })
        .unwrap();
    }

    #[test]
    fn test_fts_search() {
        let db = setup();
        db.with_conn(|conn| {
            insert(conn, &make_note("fts_001", "Meeting with Alice"))?;
            insert(conn, &make_note("fts_002", "Shopping List"))?;
            insert(conn, &make_note("fts_003", "Meeting Agenda"))?;

            let results = search_fts(conn, "meeting", 50)?;
            assert_eq!(results.len(), 2);
            Ok(())
        })
        .unwrap();
    }

    #[test]
    fn test_find_all_pagination() {
        let db = setup();
        db.with_conn(|conn| {
            for i in 0..5 {
                let mut note = make_note(&format!("page_{:03}", i), &format!("Note {}", i));
                note.updated_at = format!("2025-06-15T10:{:02}:00", i);
                insert(conn, &note)?;
            }

            let page1 = find_all(
                conn,
                &NoteFilter::default(),
                &PaginationParams {
                    cursor: None,
                    limit: Some(3),
                },
            )?;
            assert_eq!(page1.items.len(), 3);
            assert!(page1.has_more);
            assert!(page1.cursor.is_some());

            let page2 = find_all(
                conn,
                &NoteFilter::default(),
                &PaginationParams {
                    cursor: page1.cursor,
                    limit: Some(3),
                },
            )?;
            assert_eq!(page2.items.len(), 2);
            assert!(!page2.has_more);

            Ok(())
        })
        .unwrap();
    }

    #[test]
    fn test_find_all_filter_archived() {
        let db = setup();
        db.with_conn(|conn| {
            insert(conn, &make_note("active_1", "Active"))?;
            let mut archived = make_note("archived_1", "Archived");
            archived.archived_at = Some("2025-06-15T12:00:00".to_string());
            insert(conn, &archived)?;

            let active = find_all(
                conn,
                &NoteFilter {
                    archived: Some(false),
                    ..Default::default()
                },
                &PaginationParams::default(),
            )?;
            assert_eq!(active.items.len(), 1);
            assert_eq!(active.items[0].id, "active_1");

            let archived_list = find_all(
                conn,
                &NoteFilter {
                    archived: Some(true),
                    ..Default::default()
                },
                &PaginationParams::default(),
            )?;
            assert_eq!(archived_list.items.len(), 1);
            assert_eq!(archived_list.items[0].id, "archived_1");

            Ok(())
        })
        .unwrap();
    }

    #[test]
    fn test_count_cache_updated_by_triggers() {
        let db = setup();
        db.with_conn(|conn| {
            let initial: u64 = conn.query_row(
                "SELECT row_count FROM count_cache WHERE table_name = 'notes'",
                [],
                |row| row.get(0),
            )?;
            assert_eq!(initial, 0);

            insert(conn, &make_note("cc_001", "Note 1"))?;
            insert(conn, &make_note("cc_002", "Note 2"))?;

            let after_insert: u64 = conn.query_row(
                "SELECT row_count FROM count_cache WHERE table_name = 'notes'",
                [],
                |row| row.get(0),
            )?;
            assert_eq!(after_insert, 2);

            soft_delete(conn, "cc_001")?;
            let after_archive: u64 = conn.query_row(
                "SELECT row_count FROM count_cache WHERE table_name = 'notes'",
                [],
                |row| row.get(0),
            )?;
            assert_eq!(after_archive, 1);

            hard_delete(conn, "cc_002")?;
            let after_delete: u64 = conn.query_row(
                "SELECT row_count FROM count_cache WHERE table_name = 'notes'",
                [],
                |row| row.get(0),
            )?;
            assert_eq!(after_delete, 0);

            Ok(())
        })
        .unwrap();
    }

    #[test]
    fn test_count_by_filter_uses_cache() {
        let db = setup();
        db.with_conn(|conn| {
            insert(conn, &make_note("cnt_001", "A"))?;
            insert(conn, &make_note("cnt_002", "B"))?;

            let count = count_by_filter(conn, &NoteFilter::default())?;
            assert_eq!(count, 2);
            Ok(())
        })
        .unwrap();
    }
}
