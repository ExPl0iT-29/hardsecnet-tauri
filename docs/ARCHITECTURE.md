## Architecture overview

hardsecnet-tauri is a desktop orchestrator for the HardSecNet security framework, built with:

- **Frontend**: React + TypeScript + Vite + Tailwind CSS.
- **Backend**: Tauri v2 with Rust.
- **Filesystem-backed data**: `modules/` tree and JSON profiles under `modules/shared/profiles/`.

### High-level flow

- React UI calls **Tauri commands** using `@tauri-apps/api` `invoke`.
- Tauri commands inspect the local filesystem and return structured JSON.
- The UI renders modules, profiles, and results for:
  - System hardening pipeline (Snapshot → Audit → Harden → Compare).
  - Network posture checks.
  - AI-style recommendations (currently stubbed; future Ollama integration).

### Tauri commands (Rust)

Defined in `src-tauri/src/main.rs`:

- `get_available_modules() -> Result<Vec<String>, String>`
  - Detects OS (`windows` vs `linux`) and lists immediate subdirectories under `modules/<os>/`.
  - Ignores non-directories and returns a sorted list.
- `get_profiles() -> Result<Vec<Profile>, String>`
  - Loads JSON profiles from `modules/shared/profiles/*.json`.
  - Validates JSON, fills missing `id`/`name` from the file name, and sorts profiles by name.
- `run_full_sequence(profile_name: Option<String>, modules: Vec<String>) -> Result<RunResult, String>`
  - Stubbed pipeline that simulates Snapshot → Audit → Harden → Compare for each selected module.
  - Returns a `RunResult` with per-module `steps` (stage, status, message).
  - Later this function can call real scripts/tools (Lynis, PowerShell, etc.).
- `get_network_checks() -> Result<Vec<NetworkCheck>, String>`
  - Returns placeholder network checks (e.g., firewall/profile status) to be replaced with real logic.
- `get_ai_recommendations(run_result: RunResult) -> Result<Vec<Recommendation>, String>`
  - Accepts the latest `RunResult` and returns stubbed recommendations.
  - This is where Ollama / NIST AI RMF logic can eventually live.

### Frontend (React)

The main UI lives in `src/App.tsx`:

- On mount, it loads:
  - Modules via `invoke('get_available_modules')`.
  - Profiles via `invoke('get_profiles')`.
- It maintains:
  - `selectedProfileId` – which profile is chosen.
  - `selectedModules` – modules to run (pre-populated from the profile).
  - `runResult` – last `RunResult` returned from `run_full_sequence`.
  - `networkChecks` – data from `get_network_checks`.
  - `aiRecs` – data from `get_ai_recommendations`.
- Tabs:
  - **Hardening** – choose profile, select modules, run the main pipeline, and see results.
  - **Network** – display network posture checks.
  - **AI Advisor** – show recommendations based on the latest run.

### Modules and profiles

- `modules/windows/*` and `modules/linux/*`
  - Each subfolder (e.g., `baseline_snapshot`, `cis_audit`) represents a module name.
  - For now, they are placeholders; later they can contain scripts or configuration.
- `modules/shared/profiles/*.json`
  - Each JSON file describes a profile:
    - `id` – stable identifier (falls back to file name if missing).
    - `name` – human-readable name shown in UI.
    - `os` – `"windows"`, `"linux"`, or omitted for generic.
    - `description` – one- or two-line explanation for users.
    - `modules` – list of module names to pre-select.
    - `cisControls` – CIS control identifiers this profile maps to.

See `CIS_MAPPING.md` for more details on how CIS benchmark spreadsheets influence these profiles.

