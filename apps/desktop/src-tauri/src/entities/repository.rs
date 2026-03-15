use rusqlite::{params, Connection, OptionalExtension};
use serde::{Deserialize, Serialize};

use crate::db::pagination::{decode_cursor, encode_cursor, Page, PaginationParams};

// ── Structs ───────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EntityType {
    pub id: String,
    pub slug: String,
    pub name: String,
    pub icon: Option<String>,
    pub color: Option<String>,
    /// JSON array of FieldDefinition objects
    pub fields: String,
    pub is_built_in: bool,
    pub created_at: String,
    pub updated_at: String,
    pub trashed_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Entity {
    pub id: String,
    pub entity_type_id: String,
    pub entity_type_slug: String,
    pub name: String,
    /// JSON object of field values
    pub fields: String,
    pub created_at: String,
    pub updated_at: String,
    pub trashed_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EntityMention {
    pub id: String,
    pub note_id: String,
    pub entity_id: String,
    pub mention_type: String,
    pub offset: Option<i64>,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NoteRelation {
    pub id: String,
    pub from_note_id: String,
    pub to_note_id: String,
    pub relation_type: String,
    pub created_at: String,
}

#[derive(Debug, Clone, Deserialize, Default)]
#[serde(rename_all = "camelCase")]
pub struct EntityFilter {
    pub entity_type_slug: Option<String>,
    pub entity_type_id: Option<String>,
    pub trashed: Option<bool>,
    pub updated_after: Option<String>,
    pub updated_before: Option<String>,
}

// ── Row mappers ───────────────────────────────────────────────────────────────

fn row_to_entity_type(row: &rusqlite::Row<'_>) -> rusqlite::Result<EntityType> {
    Ok(EntityType {
        id: row.get("id")?,
        slug: row.get("slug")?,
        name: row.get("name")?,
        icon: row.get("icon")?,
        color: row.get("color")?,
        fields: row.get("fields")?,
        is_built_in: row.get::<_, i32>("is_built_in")? != 0,
        created_at: row.get("created_at")?,
        updated_at: row.get("updated_at")?,
        trashed_at: row.get("trashed_at")?,
    })
}

fn row_to_entity(row: &rusqlite::Row<'_>) -> rusqlite::Result<Entity> {
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
}

fn row_to_mention(row: &rusqlite::Row<'_>) -> rusqlite::Result<EntityMention> {
    Ok(EntityMention {
        id: row.get("id")?,
        note_id: row.get("note_id")?,
        entity_id: row.get("entity_id")?,
        mention_type: row.get("mention_type")?,
        offset: row.get("offset")?,
        created_at: row.get("created_at")?,
    })
}

fn row_to_relation(row: &rusqlite::Row<'_>) -> rusqlite::Result<NoteRelation> {
    Ok(NoteRelation {
        id: row.get("id")?,
        from_note_id: row.get("from_note_id")?,
        to_note_id: row.get("to_note_id")?,
        relation_type: row.get("relation_type")?,
        created_at: row.get("created_at")?,
    })
}

// ── EntityType repository ─────────────────────────────────────────────────────

pub fn find_entity_type_by_id(
    conn: &Connection,
    id: &str,
) -> rusqlite::Result<Option<EntityType>> {
    conn.query_row(
        "SELECT id, slug, name, icon, color, fields, is_built_in,
                created_at, updated_at, trashed_at
         FROM entity_types WHERE id = ?1",
        params![id],
        row_to_entity_type,
    )
    .optional()
}

pub fn find_entity_type_by_slug(
    conn: &Connection,
    slug: &str,
) -> rusqlite::Result<Option<EntityType>> {
    conn.query_row(
        "SELECT id, slug, name, icon, color, fields, is_built_in,
                created_at, updated_at, trashed_at
         FROM entity_types WHERE slug = ?1",
        params![slug],
        row_to_entity_type,
    )
    .optional()
}

pub fn find_all_entity_types(
    conn: &Connection,
    include_trashed: bool,
) -> rusqlite::Result<Vec<EntityType>> {
    let sql = if include_trashed {
        "SELECT id, slug, name, icon, color, fields, is_built_in,
                created_at, updated_at, trashed_at
         FROM entity_types
         ORDER BY is_built_in DESC, name ASC"
    } else {
        "SELECT id, slug, name, icon, color, fields, is_built_in,
                created_at, updated_at, trashed_at
         FROM entity_types
         WHERE trashed_at IS NULL
         ORDER BY is_built_in DESC, name ASC"
    };

    let mut stmt = conn.prepare(sql)?;
    let rows = stmt
        .query_map([], row_to_entity_type)?
        .collect::<rusqlite::Result<Vec<_>>>()?;
    Ok(rows)
}

pub fn insert_entity_type(conn: &Connection, et: &EntityType) -> rusqlite::Result<()> {
    conn.execute(
        "INSERT INTO entity_types
            (id, slug, name, icon, color, fields, is_built_in, created_at, updated_at, trashed_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
        params![
            et.id,
            et.slug,
            et.name,
            et.icon,
            et.color,
            et.fields,
            et.is_built_in as i32,
            et.created_at,
            et.updated_at,
            et.trashed_at,
        ],
    )?;
    Ok(())
}

pub fn update_entity_type(conn: &Connection, et: &EntityType) -> rusqlite::Result<()> {
    conn.execute(
        "UPDATE entity_types
         SET slug = ?1, name = ?2, icon = ?3, color = ?4, fields = ?5,
             updated_at = ?6, trashed_at = ?7
         WHERE id = ?8",
        params![
            et.slug,
            et.name,
            et.icon,
            et.color,
            et.fields,
            et.updated_at,
            et.trashed_at,
            et.id,
        ],
    )?;
    Ok(())
}

pub fn trash_entity_type(conn: &Connection, id: &str, now: &str) -> rusqlite::Result<()> {
    conn.execute(
        "UPDATE entity_types SET trashed_at = ?1, updated_at = ?1
         WHERE id = ?2 AND trashed_at IS NULL",
        params![now, id],
    )?;
    Ok(())
}

pub fn hard_delete_entity_type(conn: &Connection, id: &str) -> rusqlite::Result<()> {
    conn.execute("DELETE FROM entity_types WHERE id = ?1", params![id])?;
    Ok(())
}

// ── Entity repository ─────────────────────────────────────────────────────────

pub fn find_entity_by_id(conn: &Connection, id: &str) -> rusqlite::Result<Option<Entity>> {
    conn.query_row(
        "SELECT id, entity_type_id, entity_type_slug, name, fields,
                created_at, updated_at, trashed_at
         FROM entities WHERE id = ?1",
        params![id],
        row_to_entity,
    )
    .optional()
}

pub fn find_all_entities(
    conn: &Connection,
    filter: &EntityFilter,
    page: &PaginationParams,
) -> rusqlite::Result<Page<Entity>> {
    let limit = page.effective_limit();
    let fetch_limit = limit + 1;

    let mut conditions = Vec::new();
    let mut bind_values: Vec<Box<dyn rusqlite::types::ToSql>> = Vec::new();

    match filter.trashed {
        Some(true) => conditions.push("trashed_at IS NOT NULL".to_string()),
        Some(false) | None => conditions.push("trashed_at IS NULL".to_string()),
    }

    if let Some(ref v) = filter.entity_type_slug {
        bind_values.push(Box::new(v.clone()));
        conditions.push(format!("entity_type_slug = ?{}", bind_values.len()));
    }
    if let Some(ref v) = filter.entity_type_id {
        bind_values.push(Box::new(v.clone()));
        conditions.push(format!("entity_type_id = ?{}", bind_values.len()));
    }
    if let Some(ref v) = filter.updated_after {
        bind_values.push(Box::new(v.clone()));
        conditions.push(format!("updated_at > ?{}", bind_values.len()));
    }
    if let Some(ref v) = filter.updated_before {
        bind_values.push(Box::new(v.clone()));
        conditions.push(format!("updated_at < ?{}", bind_values.len()));
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

    let where_clause = format!("WHERE {}", conditions.join(" AND "));

    bind_values.push(Box::new(fetch_limit));
    let limit_idx = bind_values.len();

    let sql = format!(
        "SELECT id, entity_type_id, entity_type_slug, name, fields,
                created_at, updated_at, trashed_at
         FROM entities
         {}
         ORDER BY updated_at DESC, id DESC
         LIMIT ?{}",
        where_clause, limit_idx
    );

    let refs: Vec<&dyn rusqlite::types::ToSql> = bind_values.iter().map(|b| b.as_ref()).collect();
    let mut stmt = conn.prepare(&sql)?;
    let rows: Vec<Entity> = stmt
        .query_map(refs.as_slice(), row_to_entity)?
        .collect::<rusqlite::Result<Vec<_>>>()?;

    let has_more = rows.len() > limit as usize;
    let items: Vec<Entity> = rows.into_iter().take(limit as usize).collect();

    let cursor = items
        .last()
        .map(|e| encode_cursor(&e.updated_at, &e.id));

    let total_estimate: u64 = conn
        .query_row(
            "SELECT row_count FROM count_cache WHERE table_name = 'entities'",
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

pub fn insert_entity(conn: &Connection, entity: &Entity) -> rusqlite::Result<()> {
    conn.execute(
        "INSERT INTO entities
            (id, entity_type_id, entity_type_slug, name, fields,
             created_at, updated_at, trashed_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        params![
            entity.id,
            entity.entity_type_id,
            entity.entity_type_slug,
            entity.name,
            entity.fields,
            entity.created_at,
            entity.updated_at,
            entity.trashed_at,
        ],
    )?;
    Ok(())
}

pub fn update_entity(conn: &Connection, entity: &Entity) -> rusqlite::Result<()> {
    conn.execute(
        "UPDATE entities
         SET name = ?1, fields = ?2, updated_at = ?3, trashed_at = ?4
         WHERE id = ?5",
        params![
            entity.name,
            entity.fields,
            entity.updated_at,
            entity.trashed_at,
            entity.id,
        ],
    )?;
    Ok(())
}

pub fn trash_entity(conn: &Connection, id: &str, now: &str) -> rusqlite::Result<()> {
    conn.execute(
        "UPDATE entities SET trashed_at = ?1, updated_at = ?1
         WHERE id = ?2 AND trashed_at IS NULL",
        params![now, id],
    )?;
    Ok(())
}

pub fn restore_entity(conn: &Connection, id: &str, now: &str) -> rusqlite::Result<()> {
    conn.execute(
        "UPDATE entities SET trashed_at = NULL, updated_at = ?1
         WHERE id = ?2 AND trashed_at IS NOT NULL",
        params![now, id],
    )?;
    Ok(())
}

pub fn hard_delete_entity(conn: &Connection, id: &str) -> rusqlite::Result<()> {
    conn.execute("DELETE FROM entities WHERE id = ?1", params![id])?;
    Ok(())
}

pub fn search_entities_fts(
    conn: &Connection,
    query: &str,
    entity_type_slug: Option<&str>,
    limit: u32,
) -> rusqlite::Result<Vec<Entity>> {
    let effective_limit = limit.min(50);

    let sql = if entity_type_slug.is_some() {
        "SELECT e.id, e.entity_type_id, e.entity_type_slug, e.name, e.fields,
                e.created_at, e.updated_at, e.trashed_at
         FROM entities_fts fts
         JOIN entities e ON e.rowid = fts.rowid
         WHERE entities_fts MATCH ?1
           AND e.entity_type_slug = ?2
           AND e.trashed_at IS NULL
         ORDER BY fts.rank
         LIMIT ?3"
    } else {
        "SELECT e.id, e.entity_type_id, e.entity_type_slug, e.name, e.fields,
                e.created_at, e.updated_at, e.trashed_at
         FROM entities_fts fts
         JOIN entities e ON e.rowid = fts.rowid
         WHERE entities_fts MATCH ?1
           AND e.trashed_at IS NULL
         ORDER BY fts.rank
         LIMIT ?2"
    };

    if let Some(slug) = entity_type_slug {
        let mut stmt = conn.prepare(sql)?;
        stmt.query_map(params![query, slug, effective_limit], row_to_entity)?
            .collect::<rusqlite::Result<Vec<_>>>()
    } else {
        let mut stmt = conn.prepare(sql)?;
        stmt.query_map(params![query, effective_limit], row_to_entity)?
            .collect::<rusqlite::Result<Vec<_>>>()
    }
}

// ── EntityMention repository ─────────────────────────────────────────────────

pub fn find_mentions_by_note(
    conn: &Connection,
    note_id: &str,
) -> rusqlite::Result<Vec<EntityMention>> {
    let mut stmt = conn.prepare(
        "SELECT id, note_id, entity_id, mention_type, offset, created_at
         FROM entity_mentions WHERE note_id = ?1
         ORDER BY offset ASC NULLS LAST, created_at ASC",
    )?;
    stmt.query_map(params![note_id], row_to_mention)?
        .collect::<rusqlite::Result<Vec<_>>>()
}

pub fn find_mentions_by_entity(
    conn: &Connection,
    entity_id: &str,
) -> rusqlite::Result<Vec<EntityMention>> {
    let mut stmt = conn.prepare(
        "SELECT id, note_id, entity_id, mention_type, offset, created_at
         FROM entity_mentions WHERE entity_id = ?1
         ORDER BY created_at DESC",
    )?;
    stmt.query_map(params![entity_id], row_to_mention)?
        .collect::<rusqlite::Result<Vec<_>>>()
}

/// Replace all mentions for a note atomically (delete + re-insert in one transaction).
pub fn replace_mentions_for_note(
    conn: &Connection,
    note_id: &str,
    mentions: &[EntityMention],
) -> rusqlite::Result<()> {
    conn.execute(
        "DELETE FROM entity_mentions WHERE note_id = ?1",
        params![note_id],
    )?;
    for m in mentions {
        conn.execute(
            "INSERT INTO entity_mentions (id, note_id, entity_id, mention_type, offset, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![m.id, m.note_id, m.entity_id, m.mention_type, m.offset, m.created_at],
        )?;
    }
    Ok(())
}

pub fn count_mentions_for_entity(conn: &Connection, entity_id: &str) -> rusqlite::Result<u64> {
    conn.query_row(
        "SELECT COUNT(*) FROM entity_mentions WHERE entity_id = ?1",
        params![entity_id],
        |row| row.get(0),
    )
}

// ── NoteRelation repository ───────────────────────────────────────────────────

pub fn find_relations_from_note(
    conn: &Connection,
    from_note_id: &str,
) -> rusqlite::Result<Vec<NoteRelation>> {
    let mut stmt = conn.prepare(
        "SELECT id, from_note_id, to_note_id, relation_type, created_at
         FROM note_relations WHERE from_note_id = ?1
         ORDER BY created_at ASC",
    )?;
    stmt.query_map(params![from_note_id], row_to_relation)?
        .collect::<rusqlite::Result<Vec<_>>>()
}

pub fn find_backlinks_for_note(
    conn: &Connection,
    to_note_id: &str,
) -> rusqlite::Result<Vec<NoteRelation>> {
    let mut stmt = conn.prepare(
        "SELECT id, from_note_id, to_note_id, relation_type, created_at
         FROM note_relations WHERE to_note_id = ?1
         ORDER BY created_at DESC",
    )?;
    stmt.query_map(params![to_note_id], row_to_relation)?
        .collect::<rusqlite::Result<Vec<_>>>()
}

/// Replace all outgoing relations from a note atomically.
pub fn replace_relations_for_note(
    conn: &Connection,
    from_note_id: &str,
    relations: &[NoteRelation],
) -> rusqlite::Result<()> {
    conn.execute(
        "DELETE FROM note_relations WHERE from_note_id = ?1",
        params![from_note_id],
    )?;
    for r in relations {
        conn.execute(
            "INSERT INTO note_relations (id, from_note_id, to_note_id, relation_type, created_at)
             VALUES (?1, ?2, ?3, ?4, ?5)",
            params![r.id, r.from_note_id, r.to_note_id, r.relation_type, r.created_at],
        )?;
    }
    Ok(())
}

pub fn count_backlinks_for_note(conn: &Connection, to_note_id: &str) -> rusqlite::Result<u64> {
    conn.query_row(
        "SELECT COUNT(*) FROM note_relations WHERE to_note_id = ?1",
        params![to_note_id],
        |row| row.get(0),
    )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::Database;

    fn setup() -> Database {
        Database::open_in_memory().expect("failed to open in-memory db")
    }

    fn make_entity_type(id: &str, slug: &str, name: &str) -> EntityType {
        EntityType {
            id: id.to_string(),
            slug: slug.to_string(),
            name: name.to_string(),
            icon: None,
            color: None,
            fields: "[]".to_string(),
            is_built_in: false,
            created_at: "2025-06-15T10:00:00".to_string(),
            updated_at: "2025-06-15T10:00:00".to_string(),
            trashed_at: None,
        }
    }

    fn make_entity(id: &str, type_id: &str, slug: &str, name: &str) -> Entity {
        Entity {
            id: id.to_string(),
            entity_type_id: type_id.to_string(),
            entity_type_slug: slug.to_string(),
            name: name.to_string(),
            fields: "{}".to_string(),
            created_at: "2025-06-15T10:00:00".to_string(),
            updated_at: "2025-06-15T10:00:00".to_string(),
            trashed_at: None,
        }
    }

    #[test]
    fn test_built_in_entity_types_seeded() {
        let db = setup();
        db.with_conn(|conn| {
            let types = find_all_entity_types(conn, false)?;
            assert_eq!(types.len(), 5);
            let slugs: Vec<&str> = types.iter().map(|t| t.slug.as_str()).collect();
            assert!(slugs.contains(&"person"));
            assert!(slugs.contains(&"project"));
            assert!(slugs.contains(&"team"));
            assert!(slugs.contains(&"decision"));
            assert!(slugs.contains(&"okr"));
            for t in &types {
                assert!(t.is_built_in);
            }
            Ok(())
        })
        .unwrap();
    }

    #[test]
    fn test_entity_type_crud() {
        let db = setup();
        db.with_conn(|conn| {
            let mut et = make_entity_type("et_001", "contact", "Contact");
            insert_entity_type(conn, &et)?;

            let found = find_entity_type_by_id(conn, "et_001")?;
            assert!(found.is_some());
            assert_eq!(found.unwrap().slug, "contact");

            let by_slug = find_entity_type_by_slug(conn, "contact")?;
            assert!(by_slug.is_some());

            et.name = "Business Contact".to_string();
            et.updated_at = "2025-06-15T11:00:00".to_string();
            update_entity_type(conn, &et)?;
            let updated = find_entity_type_by_id(conn, "et_001")?.unwrap();
            assert_eq!(updated.name, "Business Contact");

            Ok(())
        })
        .unwrap();
    }

    #[test]
    fn test_entity_type_trash_and_hard_delete() {
        let db = setup();
        db.with_conn(|conn| {
            insert_entity_type(conn, &make_entity_type("et_002", "vendor", "Vendor"))?;
            trash_entity_type(conn, "et_002", "2025-06-15T12:00:00")?;

            let found = find_entity_type_by_id(conn, "et_002")?.unwrap();
            assert!(found.trashed_at.is_some());

            let active = find_all_entity_types(conn, false)?;
            assert!(!active.iter().any(|t| t.id == "et_002"));

            hard_delete_entity_type(conn, "et_002")?;
            assert!(find_entity_type_by_id(conn, "et_002")?.is_none());
            Ok(())
        })
        .unwrap();
    }

    #[test]
    fn test_entity_crud() {
        let db = setup();
        db.with_conn(|conn| {
            let type_id = "01J00000000000000000000001";
            let mut entity = make_entity("ent_001", type_id, "person", "Alice");
            insert_entity(conn, &entity)?;

            let found = find_entity_by_id(conn, "ent_001")?;
            assert!(found.is_some());
            assert_eq!(found.unwrap().name, "Alice");

            entity.name = "Alice Smith".to_string();
            entity.updated_at = "2025-06-15T11:00:00".to_string();
            update_entity(conn, &entity)?;
            let updated = find_entity_by_id(conn, "ent_001")?.unwrap();
            assert_eq!(updated.name, "Alice Smith");

            Ok(())
        })
        .unwrap();
    }

    #[test]
    fn test_entity_trash_and_restore() {
        let db = setup();
        db.with_conn(|conn| {
            let type_id = "01J00000000000000000000001";
            insert_entity(conn, &make_entity("ent_002", type_id, "person", "Bob"))?;

            trash_entity(conn, "ent_002", "2025-06-15T12:00:00")?;
            let trashed = find_entity_by_id(conn, "ent_002")?.unwrap();
            assert!(trashed.trashed_at.is_some());

            restore_entity(conn, "ent_002", "2025-06-15T13:00:00")?;
            let restored = find_entity_by_id(conn, "ent_002")?.unwrap();
            assert!(restored.trashed_at.is_none());

            Ok(())
        })
        .unwrap();
    }

    #[test]
    fn test_entity_hard_delete() {
        let db = setup();
        db.with_conn(|conn| {
            let type_id = "01J00000000000000000000001";
            insert_entity(conn, &make_entity("ent_003", type_id, "person", "Carol"))?;
            hard_delete_entity(conn, "ent_003")?;
            assert!(find_entity_by_id(conn, "ent_003")?.is_none());
            Ok(())
        })
        .unwrap();
    }

    #[test]
    fn test_entity_pagination() {
        let db = setup();
        db.with_conn(|conn| {
            let type_id = "01J00000000000000000000001";
            for i in 0..5 {
                let mut e = make_entity(
                    &format!("pag_{:03}", i),
                    type_id,
                    "person",
                    &format!("Person {}", i),
                );
                e.updated_at = format!("2025-06-15T10:{:02}:00", i);
                insert_entity(conn, &e)?;
            }

            let page1 = find_all_entities(
                conn,
                &EntityFilter::default(),
                &PaginationParams {
                    cursor: None,
                    limit: Some(3),
                },
            )?;
            assert_eq!(page1.items.len(), 3);
            assert!(page1.has_more);

            let page2 = find_all_entities(
                conn,
                &EntityFilter::default(),
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
    fn test_entity_fts_search() {
        let db = setup();
        db.with_conn(|conn| {
            let type_id = "01J00000000000000000000001";
            insert_entity(conn, &make_entity("fts_001", type_id, "person", "Alice Johnson"))?;
            insert_entity(conn, &make_entity("fts_002", type_id, "person", "Bob Smith"))?;
            insert_entity(conn, &make_entity("fts_003", type_id, "person", "Alice Cooper"))?;

            let results = search_entities_fts(conn, "Alice", None, 50)?;
            assert_eq!(results.len(), 2);
            Ok(())
        })
        .unwrap();
    }

    #[test]
    fn test_entity_count_cache_triggers() {
        let db = setup();
        db.with_conn(|conn| {
            let initial: u64 = conn.query_row(
                "SELECT row_count FROM count_cache WHERE table_name = 'entities'",
                [],
                |row| row.get(0),
            )?;
            assert_eq!(initial, 0);

            let type_id = "01J00000000000000000000001";
            insert_entity(conn, &make_entity("cc_001", type_id, "person", "Dave"))?;
            insert_entity(conn, &make_entity("cc_002", type_id, "person", "Eve"))?;

            let after_insert: u64 = conn.query_row(
                "SELECT row_count FROM count_cache WHERE table_name = 'entities'",
                [],
                |row| row.get(0),
            )?;
            assert_eq!(after_insert, 2);

            trash_entity(conn, "cc_001", "2025-06-15T12:00:00")?;
            let after_trash: u64 = conn.query_row(
                "SELECT row_count FROM count_cache WHERE table_name = 'entities'",
                [],
                |row| row.get(0),
            )?;
            assert_eq!(after_trash, 1);

            restore_entity(conn, "cc_001", "2025-06-15T13:00:00")?;
            let after_restore: u64 = conn.query_row(
                "SELECT row_count FROM count_cache WHERE table_name = 'entities'",
                [],
                |row| row.get(0),
            )?;
            assert_eq!(after_restore, 2);

            hard_delete_entity(conn, "cc_002")?;
            let after_delete: u64 = conn.query_row(
                "SELECT row_count FROM count_cache WHERE table_name = 'entities'",
                [],
                |row| row.get(0),
            )?;
            assert_eq!(after_delete, 1);

            Ok(())
        })
        .unwrap();
    }

    #[test]
    fn test_mentions_replace_for_note() {
        let db = setup();
        db.with_conn(|conn| {
            // Insert a note (needed for FK constraint)
            conn.execute(
                "INSERT INTO notes (id, title, body, body_plain) VALUES (?1, 'N', '', '')",
                params!["note_001"],
            )?;
            let type_id = "01J00000000000000000000001";
            insert_entity(conn, &make_entity("ent_m01", type_id, "person", "Frank"))?;
            insert_entity(conn, &make_entity("ent_m02", type_id, "person", "Grace"))?;

            let mentions = vec![
                EntityMention {
                    id: "men_001".to_string(),
                    note_id: "note_001".to_string(),
                    entity_id: "ent_m01".to_string(),
                    mention_type: "inline".to_string(),
                    offset: Some(10),
                    created_at: "2025-06-15T10:00:00".to_string(),
                },
                EntityMention {
                    id: "men_002".to_string(),
                    note_id: "note_001".to_string(),
                    entity_id: "ent_m02".to_string(),
                    mention_type: "property".to_string(),
                    offset: None,
                    created_at: "2025-06-15T10:00:00".to_string(),
                },
            ];
            replace_mentions_for_note(conn, "note_001", &mentions)?;

            let found = find_mentions_by_note(conn, "note_001")?;
            assert_eq!(found.len(), 2);

            let by_entity = find_mentions_by_entity(conn, "ent_m01")?;
            assert_eq!(by_entity.len(), 1);

            let count = count_mentions_for_entity(conn, "ent_m01")?;
            assert_eq!(count, 1);

            // Replace with empty to clear
            replace_mentions_for_note(conn, "note_001", &[])?;
            let cleared = find_mentions_by_note(conn, "note_001")?;
            assert!(cleared.is_empty());

            Ok(())
        })
        .unwrap();
    }

    #[test]
    fn test_note_relations_replace() {
        let db = setup();
        db.with_conn(|conn| {
            conn.execute(
                "INSERT INTO notes (id, title, body, body_plain) VALUES (?1, 'N1', '', '')",
                params!["note_rel_01"],
            )?;
            conn.execute(
                "INSERT INTO notes (id, title, body, body_plain) VALUES (?1, 'N2', '', '')",
                params!["note_rel_02"],
            )?;
            conn.execute(
                "INSERT INTO notes (id, title, body, body_plain) VALUES (?1, 'N3', '', '')",
                params!["note_rel_03"],
            )?;

            let relations = vec![
                NoteRelation {
                    id: "rel_001".to_string(),
                    from_note_id: "note_rel_01".to_string(),
                    to_note_id: "note_rel_02".to_string(),
                    relation_type: "link".to_string(),
                    created_at: "2025-06-15T10:00:00".to_string(),
                },
                NoteRelation {
                    id: "rel_002".to_string(),
                    from_note_id: "note_rel_01".to_string(),
                    to_note_id: "note_rel_03".to_string(),
                    relation_type: "embed".to_string(),
                    created_at: "2025-06-15T10:00:00".to_string(),
                },
            ];
            replace_relations_for_note(conn, "note_rel_01", &relations)?;

            let outgoing = find_relations_from_note(conn, "note_rel_01")?;
            assert_eq!(outgoing.len(), 2);

            let backlinks = find_backlinks_for_note(conn, "note_rel_02")?;
            assert_eq!(backlinks.len(), 1);
            assert_eq!(backlinks[0].from_note_id, "note_rel_01");

            let count = count_backlinks_for_note(conn, "note_rel_02")?;
            assert_eq!(count, 1);

            Ok(())
        })
        .unwrap();
    }
}
