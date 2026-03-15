mod commands;
mod db;
mod entities;
mod notes;

use db::Database;
use std::path::PathBuf;

fn get_db_path() -> PathBuf {
    let data_dir = dirs::data_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("com.locus.app");
    data_dir.join("locus.db")
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    env_logger::init();

    let db_path = get_db_path();
    log::info!("Database path: {:?}", db_path);

    let database = Database::open(&db_path).expect("Failed to open database");

    tauri::Builder::default()
        .manage(database)
        .invoke_handler(tauri::generate_handler![
            commands::ping,
            commands::get_db_status,
            notes::commands::notes_create,
            notes::commands::notes_get,
            notes::commands::notes_list,
            notes::commands::notes_update,
            notes::commands::notes_delete,
            notes::commands::notes_search,
            entities::commands::entity_types_list,
            entities::commands::entity_types_get,
            entities::commands::entity_types_get_by_slug,
            entities::commands::entity_types_create,
            entities::commands::entity_types_update,
            entities::commands::entity_types_trash,
            entities::commands::entity_types_hard_delete,
            entities::commands::entities_create,
            entities::commands::entities_get,
            entities::commands::entities_list,
            entities::commands::entities_update,
            entities::commands::entities_trash,
            entities::commands::entities_restore,
            entities::commands::entities_hard_delete,
            entities::commands::entities_search,
            entities::commands::entities_evaluate_computed,
            entities::commands::entities_parse_query,
            entities::commands::entity_mentions_replace,
            entities::commands::entity_mentions_for_note,
            entities::commands::entity_mentions_for_entity,
            entities::commands::note_relations_replace,
            entities::commands::note_relations_for_note,
            entities::commands::note_backlinks,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
