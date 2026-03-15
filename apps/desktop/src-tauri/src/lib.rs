mod commands;
mod db;

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
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
