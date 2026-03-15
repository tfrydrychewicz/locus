use serde::Deserialize;
use tauri::State;

use crate::commands::CommandError;
use crate::db::pagination::{Page, PaginationParams};
use crate::db::Database;
use crate::notes::repository::{self, Note, NoteFilter, NoteSearchResult};

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateNoteParams {
    pub title: Option<String>,
    pub body: Option<String>,
    pub template_id: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateNoteParams {
    pub id: String,
    pub title: Option<String>,
    pub body: Option<String>,
    pub body_plain: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ListNotesParams {
    pub filter: Option<NoteFilter>,
    pub cursor: Option<String>,
    pub limit: Option<u32>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SearchNotesParams {
    pub query: String,
    pub limit: Option<u32>,
}

#[tauri::command]
pub fn notes_create(
    db: State<'_, Database>,
    params: CreateNoteParams,
) -> Result<Note, CommandError> {
    let id = ulid::Ulid::new().to_string();
    let now = chrono::Utc::now().format("%Y-%m-%dT%H:%M:%S").to_string();

    let note = Note {
        id,
        title: params.title.unwrap_or_else(|| "Untitled".to_string()),
        body: params.body.clone().unwrap_or_default(),
        body_plain: params.body.unwrap_or_default(),
        template_id: params.template_id,
        embedding_dirty: true,
        created_at: now.clone(),
        updated_at: now,
        archived_at: None,
    };

    db.with_conn(|conn| repository::insert(conn, &note))
        .map_err(CommandError::from)?;

    Ok(note)
}

#[tauri::command]
pub fn notes_get(db: State<'_, Database>, id: String) -> Result<Option<Note>, CommandError> {
    db.with_conn(|conn| repository::find_by_id(conn, &id))
        .map_err(CommandError::from)
}

#[tauri::command]
pub fn notes_list(
    db: State<'_, Database>,
    params: ListNotesParams,
) -> Result<Page<Note>, CommandError> {
    let filter = params.filter.unwrap_or_default();
    let page = PaginationParams {
        cursor: params.cursor,
        limit: params.limit,
    };

    db.with_conn(|conn| repository::find_all(conn, &filter, &page))
        .map_err(CommandError::from)
}

#[tauri::command]
pub fn notes_update(
    db: State<'_, Database>,
    params: UpdateNoteParams,
) -> Result<Note, CommandError> {
    db.with_conn(|conn| {
        let existing = repository::find_by_id(conn, &params.id)?;
        let mut note = existing.ok_or_else(|| {
            rusqlite::Error::QueryReturnedNoRows
        })?;

        if let Some(title) = params.title {
            note.title = title;
        }
        if let Some(body) = params.body {
            note.body = body;
            note.embedding_dirty = true;
        }
        if let Some(body_plain) = params.body_plain {
            note.body_plain = body_plain;
        }

        note.updated_at = chrono::Utc::now().format("%Y-%m-%dT%H:%M:%S").to_string();
        repository::update(conn, &note)?;
        Ok(note)
    })
    .map_err(CommandError::from)
}

#[tauri::command]
pub fn notes_delete(
    db: State<'_, Database>,
    id: String,
    hard: Option<bool>,
) -> Result<(), CommandError> {
    db.with_conn(|conn| {
        let existing = repository::find_by_id(conn, &id)?;
        if existing.is_none() {
            return Err(rusqlite::Error::QueryReturnedNoRows);
        }

        if hard.unwrap_or(false) {
            repository::hard_delete(conn, &id)
        } else {
            repository::soft_delete(conn, &id)
        }
    })
    .map_err(CommandError::from)
}

#[tauri::command]
pub fn notes_search(
    db: State<'_, Database>,
    params: SearchNotesParams,
) -> Result<Vec<NoteSearchResult>, CommandError> {
    let limit = params.limit.unwrap_or(50).min(50);

    db.with_conn(|conn| repository::search_fts(conn, &params.query, limit))
        .map_err(CommandError::from)
}
