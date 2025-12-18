#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::fs;
use std::path::Path;
use walkdir::WalkDir;

#[tauri::command]
fn get_available_modules() -> Result<Vec<String>, String> {
    // Detect current OS
    let os_folder = if cfg!(target_os = "windows") {
        "windows"
    } else {
        "linux"
    };

    let modules_path = Path::new("modules").join(os_folder);

    if !modules_path.exists() {
        return Ok(vec![]);
    }

    let modules: Vec<String> = WalkDir::new(&modules_path)
        .min_depth(1)
        .max_depth(1)
        .into_iter()
        .filter_map(|e| e.ok())
        .filter(|e| e.file_type().is_dir())
        .filter_map(|e| {
            e.path()
                .file_name()
                .and_then(|name| name.to_str())
                .map(|s| s.to_string())
        })
        .collect();

    Ok(modules)
}

#[tauri::command]
fn get_profiles() -> Result<Vec<String>, String> {
    let profiles_dir = Path::new("modules/shared/profiles");

    if !profiles_dir.exists() {
        return Ok(vec![]);
    }

    let profiles: Vec<String> = fs::read_dir(profiles_dir)
        .map_err(|e| format!("Failed to read profiles directory: {}", e))?
        .filter_map(|entry| entry.ok())
        .filter(|entry| {
            entry
                .path()
                .extension()
                .and_then(|ext| ext.to_str())
                == Some("json")
        })
        .filter_map(|entry| {
            entry
                .path()
                .file_stem()
                .and_then(|stem| stem.to_str())
                .map(|s| s.to_string())
        })
        .collect();

    Ok(profiles)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_available_modules, get_profiles])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}