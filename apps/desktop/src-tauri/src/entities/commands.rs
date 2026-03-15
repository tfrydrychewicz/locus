use serde::Deserialize;
use tauri::State;

use crate::commands::CommandError;
use crate::db::pagination::{Page, PaginationParams};
use crate::db::Database;
use crate::entities::lql;
use crate::entities::repository::{
    self, Entity, EntityFilter, EntityMention, EntityType, NoteRelation,
};

// ── EntityType commands ───────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateEntityTypeParams {
    pub slug: String,
    pub name: String,
    pub icon: Option<String>,
    pub color: Option<String>,
    pub fields: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateEntityTypeParams {
    pub id: String,
    pub name: Option<String>,
    pub icon: Option<String>,
    pub color: Option<String>,
    pub fields: Option<String>,
}

#[tauri::command]
pub fn entity_types_list(db: State<'_, Database>) -> Result<Vec<EntityType>, CommandError> {
    db.with_conn(|conn| repository::find_all_entity_types(conn, false))
        .map_err(CommandError::from)
}

#[tauri::command]
pub fn entity_types_get(
    db: State<'_, Database>,
    id: String,
) -> Result<Option<EntityType>, CommandError> {
    db.with_conn(|conn| repository::find_entity_type_by_id(conn, &id))
        .map_err(CommandError::from)
}

#[tauri::command]
pub fn entity_types_get_by_slug(
    db: State<'_, Database>,
    slug: String,
) -> Result<Option<EntityType>, CommandError> {
    db.with_conn(|conn| repository::find_entity_type_by_slug(conn, &slug))
        .map_err(CommandError::from)
}

#[tauri::command]
pub fn entity_types_create(
    db: State<'_, Database>,
    params: CreateEntityTypeParams,
) -> Result<EntityType, CommandError> {
    let id = ulid::Ulid::new().to_string();
    let now = chrono::Utc::now().format("%Y-%m-%dT%H:%M:%S").to_string();

    let et = EntityType {
        id,
        slug: params.slug,
        name: params.name,
        icon: params.icon,
        color: params.color,
        fields: params.fields.unwrap_or_else(|| "[]".to_string()),
        is_built_in: false,
        created_at: now.clone(),
        updated_at: now,
        trashed_at: None,
    };

    db.with_conn(|conn| {
        repository::insert_entity_type(conn, &et)?;
        Ok(et)
    })
    .map_err(CommandError::from)
}

#[tauri::command]
pub fn entity_types_update(
    db: State<'_, Database>,
    params: UpdateEntityTypeParams,
) -> Result<EntityType, CommandError> {
    db.with_conn(|conn| {
        let existing = repository::find_entity_type_by_id(conn, &params.id)?;
        let mut et = existing.ok_or(rusqlite::Error::QueryReturnedNoRows)?;

        if let Some(name) = params.name {
            et.name = name;
        }
        if let Some(icon) = params.icon {
            et.icon = Some(icon);
        }
        if let Some(color) = params.color {
            et.color = Some(color);
        }
        if let Some(fields) = params.fields {
            et.fields = fields;
        }
        et.updated_at = chrono::Utc::now().format("%Y-%m-%dT%H:%M:%S").to_string();

        repository::update_entity_type(conn, &et)?;
        Ok(et)
    })
    .map_err(CommandError::from)
}

#[tauri::command]
pub fn entity_types_trash(db: State<'_, Database>, id: String) -> Result<(), CommandError> {
    db.with_conn(|conn| {
        let existing = repository::find_entity_type_by_id(conn, &id)?;
        let et = existing.ok_or(rusqlite::Error::QueryReturnedNoRows)?;
        if et.is_built_in {
            return Err(rusqlite::Error::InvalidParameterName(
                "cannot trash a built-in entity type".to_string(),
            ));
        }
        let now = chrono::Utc::now().format("%Y-%m-%dT%H:%M:%S").to_string();
        repository::trash_entity_type(conn, &id, &now)
    })
    .map_err(CommandError::from)
}

#[tauri::command]
pub fn entity_types_hard_delete(db: State<'_, Database>, id: String) -> Result<(), CommandError> {
    db.with_conn(|conn| {
        let existing = repository::find_entity_type_by_id(conn, &id)?;
        let et = existing.ok_or(rusqlite::Error::QueryReturnedNoRows)?;
        if et.is_built_in {
            return Err(rusqlite::Error::InvalidParameterName(
                "cannot delete a built-in entity type".to_string(),
            ));
        }
        repository::hard_delete_entity_type(conn, &id)
    })
    .map_err(CommandError::from)
}

// ── Entity commands ────────────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateEntityParams {
    pub entity_type_id: String,
    pub name: String,
    pub fields: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateEntityParams {
    pub id: String,
    pub name: Option<String>,
    pub fields: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ListEntitiesParams {
    pub filter: Option<EntityFilter>,
    pub cursor: Option<String>,
    pub limit: Option<u32>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SearchEntitiesParams {
    pub query: String,
    pub entity_type_slug: Option<String>,
    pub limit: Option<u32>,
}

#[tauri::command]
pub fn entities_create(
    db: State<'_, Database>,
    params: CreateEntityParams,
) -> Result<Entity, CommandError> {
    db.with_conn(|conn| {
        let et = repository::find_entity_type_by_id(conn, &params.entity_type_id)?
            .ok_or(rusqlite::Error::QueryReturnedNoRows)?;

        let id = ulid::Ulid::new().to_string();
        let now = chrono::Utc::now().format("%Y-%m-%dT%H:%M:%S").to_string();

        let entity = Entity {
            id,
            entity_type_id: et.id,
            entity_type_slug: et.slug,
            name: params.name,
            fields: params.fields.unwrap_or_else(|| "{}".to_string()),
            created_at: now.clone(),
            updated_at: now,
            trashed_at: None,
        };

        repository::insert_entity(conn, &entity)?;
        Ok(entity)
    })
    .map_err(CommandError::from)
}

#[tauri::command]
pub fn entities_get(
    db: State<'_, Database>,
    id: String,
) -> Result<Option<Entity>, CommandError> {
    db.with_conn(|conn| repository::find_entity_by_id(conn, &id))
        .map_err(CommandError::from)
}

#[tauri::command]
pub fn entities_list(
    db: State<'_, Database>,
    params: ListEntitiesParams,
) -> Result<Page<Entity>, CommandError> {
    let filter = params.filter.unwrap_or_default();
    let page = PaginationParams {
        cursor: params.cursor,
        limit: params.limit,
    };
    db.with_conn(|conn| repository::find_all_entities(conn, &filter, &page))
        .map_err(CommandError::from)
}

#[tauri::command]
pub fn entities_update(
    db: State<'_, Database>,
    params: UpdateEntityParams,
) -> Result<Entity, CommandError> {
    db.with_conn(|conn| {
        let existing = repository::find_entity_by_id(conn, &params.id)?;
        let mut entity = existing.ok_or(rusqlite::Error::QueryReturnedNoRows)?;

        if let Some(name) = params.name {
            entity.name = name;
        }
        if let Some(fields) = params.fields {
            entity.fields = fields;
        }
        entity.updated_at = chrono::Utc::now().format("%Y-%m-%dT%H:%M:%S").to_string();

        repository::update_entity(conn, &entity)?;
        Ok(entity)
    })
    .map_err(CommandError::from)
}

#[tauri::command]
pub fn entities_trash(db: State<'_, Database>, id: String) -> Result<(), CommandError> {
    db.with_conn(|conn| {
        let existing = repository::find_entity_by_id(conn, &id)?;
        if existing.is_none() {
            return Err(rusqlite::Error::QueryReturnedNoRows);
        }
        let now = chrono::Utc::now().format("%Y-%m-%dT%H:%M:%S").to_string();
        repository::trash_entity(conn, &id, &now)
    })
    .map_err(CommandError::from)
}

#[tauri::command]
pub fn entities_restore(db: State<'_, Database>, id: String) -> Result<(), CommandError> {
    db.with_conn(|conn| {
        let existing = repository::find_entity_by_id(conn, &id)?;
        if existing.is_none() {
            return Err(rusqlite::Error::QueryReturnedNoRows);
        }
        let now = chrono::Utc::now().format("%Y-%m-%dT%H:%M:%S").to_string();
        repository::restore_entity(conn, &id, &now)
    })
    .map_err(CommandError::from)
}

#[tauri::command]
pub fn entities_hard_delete(db: State<'_, Database>, id: String) -> Result<(), CommandError> {
    db.with_conn(|conn| {
        let existing = repository::find_entity_by_id(conn, &id)?;
        if existing.is_none() {
            return Err(rusqlite::Error::QueryReturnedNoRows);
        }
        repository::hard_delete_entity(conn, &id)
    })
    .map_err(CommandError::from)
}

#[tauri::command]
pub fn entities_search(
    db: State<'_, Database>,
    params: SearchEntitiesParams,
) -> Result<Vec<Entity>, CommandError> {
    let limit = params.limit.unwrap_or(50).min(50);
    db.with_conn(|conn| {
        repository::search_entities_fts(
            conn,
            &params.query,
            params.entity_type_slug.as_deref(),
            limit,
        )
    })
    .map_err(CommandError::from)
}

// ── Computed query commands ────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EvaluateComputedParams {
    pub query: String,
    pub this_entity_id: Option<String>,
    pub cursor: Option<String>,
    pub limit: Option<u32>,
}

/// Execute an LQL computed query against the entities table.
/// Translates LQL → SQL WHERE clause and runs it with keyset pagination.
#[tauri::command]
pub fn entities_evaluate_computed(
    db: State<'_, Database>,
    params: EvaluateComputedParams,
) -> Result<Page<Entity>, CommandError> {
    let (lql_sql, lql_params) =
        lql::lql_to_sql(&params.query, params.this_entity_id.as_deref())
            .map_err(CommandError::Validation)?;

    let page = PaginationParams {
        cursor: params.cursor,
        limit: params.limit,
    };
    let limit = page.effective_limit();
    let fetch_limit = limit + 1;

    db.with_conn(|conn| {
        let mut conditions = vec!["trashed_at IS NULL".to_string(), lql_sql];
        let mut bind_values: Vec<Box<dyn rusqlite::types::ToSql>> = lql_params
            .into_iter()
            .map(|v| -> Box<dyn rusqlite::types::ToSql> { Box::new(v) })
            .collect();

        if let Some(ref cursor_str) = page.cursor {
            if let Some((sort_key, cursor_id)) = crate::db::pagination::decode_cursor(cursor_str) {
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

        bind_values.push(Box::new(fetch_limit));
        let limit_idx = bind_values.len();

        let sql = format!(
            "SELECT id, entity_type_id, entity_type_slug, name, fields,
                    created_at, updated_at, trashed_at
             FROM entities
             WHERE {}
             ORDER BY updated_at DESC, id DESC
             LIMIT ?{}",
            conditions.join(" AND "),
            limit_idx
        );

        let refs: Vec<&dyn rusqlite::types::ToSql> =
            bind_values.iter().map(|b| b.as_ref()).collect();
        let mut stmt = conn.prepare(&sql)?;
        let rows: Vec<Entity> = stmt
            .query_map(refs.as_slice(), |row| {
                Ok(Entity {
                    id: row.get("id")?,
                    entity_type_id: row.get("entity_type_id")?,
                    entity_type_slug: row.get("entity_type_slug")?,
                    name: row.get("name")?,
                    fields: row.get("fields")?,
                    created_at: row.get("created_at")?,
                    updated_at: row.get("updated_at")?,
                    trashed_at: row.get("trashed_at")?,
                })
            })?
            .collect::<rusqlite::Result<Vec<_>>>()?;

        let has_more = rows.len() > limit as usize;
        let items: Vec<Entity> = rows.into_iter().take(limit as usize).collect();
        let cursor = items
            .last()
            .map(|e| crate::db::pagination::encode_cursor(&e.updated_at, &e.id));

        let total_estimate: u64 = conn
            .query_row(
                "SELECT row_count FROM count_cache WHERE table_name = 'entities'",
                [],
                |r| r.get(0),
            )
            .unwrap_or(0);

        Ok(crate::db::pagination::Page {
            items,
            cursor,
            has_more,
            total_estimate,
        })
    })
    .map_err(CommandError::from)
}

/// Validate an LQL query string. Returns true if valid, CommandError::Validation if not.
#[tauri::command]
pub fn entities_parse_query(query: String) -> Result<bool, CommandError> {
    lql::validate_lql(&query)
        .map(|_| true)
        .map_err(CommandError::Validation)
}

// ── EntityMention commands ────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct MentionInput {
    pub entity_id: String,
    pub mention_type: String,
    pub offset: Option<i64>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ReplaceMentionsParams {
    pub note_id: String,
    pub mentions: Vec<MentionInput>,
}

#[tauri::command]
pub fn entity_mentions_replace(
    db: State<'_, Database>,
    params: ReplaceMentionsParams,
) -> Result<Vec<EntityMention>, CommandError> {
    db.with_conn(|conn| {
        let now = chrono::Utc::now().format("%Y-%m-%dT%H:%M:%S").to_string();
        let mentions: Vec<EntityMention> = params
            .mentions
            .into_iter()
            .map(|m| EntityMention {
                id: ulid::Ulid::new().to_string(),
                note_id: params.note_id.clone(),
                entity_id: m.entity_id,
                mention_type: m.mention_type,
                offset: m.offset,
                created_at: now.clone(),
            })
            .collect();

        repository::replace_mentions_for_note(conn, &params.note_id, &mentions)?;
        Ok(mentions)
    })
    .map_err(CommandError::from)
}

#[tauri::command]
pub fn entity_mentions_for_note(
    db: State<'_, Database>,
    note_id: String,
) -> Result<Vec<EntityMention>, CommandError> {
    db.with_conn(|conn| repository::find_mentions_by_note(conn, &note_id))
        .map_err(CommandError::from)
}

#[tauri::command]
pub fn entity_mentions_for_entity(
    db: State<'_, Database>,
    entity_id: String,
) -> Result<Vec<EntityMention>, CommandError> {
    db.with_conn(|conn| repository::find_mentions_by_entity(conn, &entity_id))
        .map_err(CommandError::from)
}

// ── NoteRelation commands ─────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RelationInput {
    pub to_note_id: String,
    pub relation_type: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ReplaceRelationsParams {
    pub from_note_id: String,
    pub relations: Vec<RelationInput>,
}

#[tauri::command]
pub fn note_relations_replace(
    db: State<'_, Database>,
    params: ReplaceRelationsParams,
) -> Result<Vec<NoteRelation>, CommandError> {
    db.with_conn(|conn| {
        let now = chrono::Utc::now().format("%Y-%m-%dT%H:%M:%S").to_string();
        let relations: Vec<NoteRelation> = params
            .relations
            .into_iter()
            .map(|r| NoteRelation {
                id: ulid::Ulid::new().to_string(),
                from_note_id: params.from_note_id.clone(),
                to_note_id: r.to_note_id,
                relation_type: r.relation_type,
                created_at: now.clone(),
            })
            .collect();

        repository::replace_relations_for_note(conn, &params.from_note_id, &relations)?;
        Ok(relations)
    })
    .map_err(CommandError::from)
}

#[tauri::command]
pub fn note_relations_for_note(
    db: State<'_, Database>,
    from_note_id: String,
) -> Result<Vec<NoteRelation>, CommandError> {
    db.with_conn(|conn| repository::find_relations_from_note(conn, &from_note_id))
        .map_err(CommandError::from)
}

#[tauri::command]
pub fn note_backlinks(
    db: State<'_, Database>,
    to_note_id: String,
) -> Result<Vec<NoteRelation>, CommandError> {
    db.with_conn(|conn| repository::find_backlinks_for_note(conn, &to_note_id))
        .map_err(CommandError::from)
}
