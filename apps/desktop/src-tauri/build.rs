use std::path::Path;

fn main() {
    let dist_dir = Path::new("../dist");
    if !dist_dir.exists() {
        std::fs::create_dir_all(dist_dir).expect("failed to create dist directory");
        std::fs::write(
            dist_dir.join("index.html"),
            "<!doctype html><html><body></body></html>",
        )
        .expect("failed to write placeholder index.html");
    }

    tauri_build::build()
}
