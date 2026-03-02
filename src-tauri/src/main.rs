#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use walkdir::WalkDir;

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Profile {
    /// Stable identifier (falls back to file name if not provided).
    #[serde(default)]
    id: String,
    /// Human-friendly name shown in the UI.
    #[serde(default)]
    name: String,
    /// Optional OS hint: "windows", "linux", or "any".
    #[serde(default)]
    os: Option<String>,
    /// Optional description for docs / UI.
    #[serde(default)]
    description: Option<String>,
    /// Modules this profile will typically run.
    #[serde(default)]
    modules: Vec<String>,
    /// Optional list of CIS control identifiers this profile maps to.
    #[serde(default)]
    cis_controls: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct StepResult {
    stage: String,
    status: String,
    message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ModuleResult {
    module: String,
    steps: Vec<StepResult>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct RunResult {
    profile: Option<String>,
    modules: Vec<ModuleResult>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct NetworkCheck {
    id: String,
    title: String,
    status: String,
    details: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Recommendation {
    id: String,
    title: String,
    severity: String,
    details: String,
    #[serde(default)]
    related_modules: Vec<String>,
}

fn os_specific_modules_path() -> PathBuf {
    let os_folder = if cfg!(target_os = "windows") {
        "windows"
    } else {
        "linux"
    };

    Path::new("modules").join(os_folder)
}

fn discover_modules(base: &Path) -> Result<Vec<String>, String> {
    if !base.exists() {
        return Ok(vec![]);
    }

    let mut modules: Vec<String> = WalkDir::new(base)
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

    modules.sort();
    Ok(modules)
}

fn load_profiles(dir: &Path) -> Result<Vec<Profile>, String> {
    if !dir.exists() {
        return Ok(vec![]);
    }

    let mut profiles = Vec::new();

    for entry in
        fs::read_dir(dir).map_err(|e| format!("Failed to read profiles directory: {e}"))?
    {
        let entry = entry.map_err(|e| format!("Failed to read profile entry: {e}"))?;
        let path = entry.path();

        if path.extension().and_then(|ext| ext.to_str()) != Some("json") {
            continue;
        }

        let raw = fs::read_to_string(&path)
            .map_err(|e| format!("Failed to read profile file {}: {e}", path.display()))?;

        if raw.trim().is_empty() {
            return Err(format!("Profile file {} is empty", path.display()));
        }

        let mut profile: Profile = serde_json::from_str(&raw)
            .map_err(|e| format!("Invalid JSON in profile {}: {e}", path.display()))?;

        // Fill in id/name from file name where needed.
        if profile.id.trim().is_empty() {
            if let Some(stem) = path.file_stem().and_then(|s| s.to_str()) {
                profile.id = stem.to_string();
            }
        }

        if profile.name.trim().is_empty() {
            profile.name = profile.id.clone();
        }

        profiles.push(profile);
    }

    profiles.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    Ok(profiles)
}

#[tauri::command]
fn get_available_modules() -> Result<Vec<String>, String> {
    let modules_path = os_specific_modules_path();
    discover_modules(&modules_path)
}

#[tauri::command]
fn get_profiles() -> Result<Vec<Profile>, String> {
    let profiles_dir = Path::new("modules/shared/profiles");
    load_profiles(profiles_dir)
}

#[tauri::command]
fn run_full_sequence(
    profile_name: Option<String>,
    modules: Vec<String>,
) -> Result<RunResult, String> {
    if modules.is_empty() {
        return Err("No modules selected for run_full_sequence".to_string());
    }

    let mut module_results = Vec::new();

    for module in modules {
        let steps = vec![
            StepResult {
                stage: "snapshot".into(),
                status: "ok".into(),
                message: format!("Snapshot captured for module '{module}'."),
            },
            StepResult {
                stage: "audit".into(),
                status: "ok".into(),
                message: format!("Baseline audit completed for module '{module}'."),
            },
            StepResult {
                stage: "harden".into(),
                status: "ok".into(),
                message: format!("Baseline hardening simulated for module '{module}'."),
            },
            StepResult {
                stage: "compare".into(),
                status: "ok".into(),
                message: format!("Drift comparison simulated for module '{module}'."),
            },
        ];

        module_results.push(ModuleResult { module, steps });
    }

    Ok(RunResult {
        profile: profile_name,
        modules: module_results,
    })
}

#[tauri::command]
fn get_network_checks() -> Result<Vec<NetworkCheck>, String> {
    let os_label = if cfg!(target_os = "windows") {
        "Windows"
    } else {
        "Linux"
    };

    let checks = vec![
        NetworkCheck {
            id: "firewall_profile".into(),
            title: format!("{os_label} firewall profile"),
            status: "info".into(),
            details:
                "Placeholder check. Integrate real firewall status (e.g., UFW or Windows Defender Firewall)."
                    .into(),
        },
        NetworkCheck {
            id: "remote_access".into(),
            title: "Remote access exposure".into(),
            status: "info".into(),
            details:
                "Placeholder check. Map to CIS controls for SSH/RDP exposure and listening ports later."
                    .into(),
        },
    ];

    Ok(checks)
}

#[tauri::command]
fn get_ai_recommendations(run_result: RunResult) -> Result<Vec<Recommendation>, String> {
    if run_result.modules.is_empty() {
        return Ok(vec![Recommendation {
            id: "no_data".into(),
            title: "Run a baseline sequence first".into(),
            severity: "info".into(),
            details:
                "No module results were provided. Run the Snapshot → Audit → Harden → Compare sequence to generate data for analysis."
                    .into(),
            related_modules: vec![],
        }]);
    }

    let module_names: Vec<String> = run_result
        .modules
        .iter()
        .map(|m| m.module.clone())
        .collect();

    // Stubbed recommendation that can later be replaced with real Ollama/AI integration.
    let recs = vec![
        Recommendation {
            id: "baseline_gap_analysis".into(),
            title: "Review baseline hardening coverage".into(),
            severity: "medium".into(),
            details: "Use CIS benchmark spreadsheets and NIST guidance to verify that each selected module fully covers its intended controls. Prioritize closing gaps on authentication, patching, and network exposure."
                .into(),
            related_modules: module_names.clone(),
        },
        Recommendation {
            id: "drift_alerting".into(),
            title: "Set up drift alerting for critical profiles".into(),
            severity: "high".into(),
            details: "For production or lab-critical machines, enable periodic drift comparisons and alerts so any deviation from the hardened baseline triggers a review."
                .into(),
            related_modules: module_names,
        },
    ];

    Ok(recs)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs;

    fn fresh_temp_dir(name: &str) -> PathBuf {
        let mut base = std::env::temp_dir();
        base.push(format!("hardsecnet_tauri_test_{name}"));
        let _ = fs::remove_dir_all(&base);
        fs::create_dir_all(&base).expect("failed to create temp dir");
        base
    }

    #[test]
    fn discover_modules_returns_sorted_directory_names() {
        let base = fresh_temp_dir("modules");

        let dir_b = base.join("b_module");
        let dir_a = base.join("a_module");
        fs::create_dir_all(&dir_b).unwrap();
        fs::create_dir_all(&dir_a).unwrap();

        let modules = discover_modules(&base).expect("discover_modules failed");
        assert_eq!(
            modules,
            vec!["a_module".to_string(), "b_module".to_string()]
        );
    }

    #[test]
    fn load_profiles_reads_valid_json_and_sorts_by_name() {
        let base = fresh_temp_dir("profiles");

        let first = base.join("z_profile.json");
        let second = base.join("a_profile.json");

        fs::write(
            &first,
            r#"{
                "id": "z_profile",
                "name": "Zulu Profile",
                "modules": ["baseline_snapshot"]
            }"#,
        )
        .unwrap();

        // Missing id/name on purpose; should fall back to file stem.
        fs::write(
            &second,
            r#"{
                "modules": ["baseline_snapshot", "cis_audit"]
            }"#,
        )
        .unwrap();

        let profiles = load_profiles(&base).expect("load_profiles failed");
        assert_eq!(profiles.len(), 2);
        assert_eq!(profiles[0].id, "a_profile");
        assert_eq!(profiles[0].name, "a_profile");
        assert_eq!(profiles[1].id, "z_profile");
        assert_eq!(profiles[1].name, "Zulu Profile");
    }

    #[test]
    fn load_profiles_errors_on_empty_file() {
        let base = fresh_temp_dir("profiles_empty");
        let empty = base.join("empty.json");
        fs::write(&empty, "").unwrap();

        let result = load_profiles(&base);
        assert!(result.is_err());
    }

    #[test]
    fn run_full_sequence_requires_modules() {
        let result = run_full_sequence(None, vec![]);
        assert!(result.is_err());
    }

    #[test]
    fn run_full_sequence_produces_steps_for_each_module() {
        let result = run_full_sequence(
            Some("test_profile".to_string()),
            vec!["mod_a".to_string(), "mod_b".to_string()],
        )
        .expect("run_full_sequence failed");

        assert_eq!(result.profile, Some("test_profile".to_string()));
        assert_eq!(result.modules.len(), 2);
        for module in result.modules {
            assert_eq!(module.steps.len(), 4);
        }
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_available_modules,
            get_profiles,
            run_full_sequence,
            get_network_checks,
            get_ai_recommendations
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}