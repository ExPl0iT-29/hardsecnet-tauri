## Roadmap-style GitHub issues for hardsecnet-tauri

Copy-paste these into GitHub in order, milestone by milestone.  
Adjust labels and assignees (`Person A`, `Person B`, `Person C`) as needed.

---

### Milestone 0 – Repo hygiene & tooling

**Issue 0.1 – Agree on workflow and tooling**  
**Labels**: meta, chore  
**Assignees**: All three  

- Decide on:
  - Branching model (`main` + feature branches).
  - Code review rules (at least 1 review per PR).
  - Required checks (`cargo test`, `npm run build`, `npm test`, `npm run lint`).
- Confirm use of:
  - `rustfmt` + `clippy` for Rust.
  - ESLint + Prettier + TypeScript for frontend.

**Done when**:

- A short note is added to `docs/CONTRIBUTING.md` describing the agreed workflow.

---

### Milestone 1 – Solid module/profile discovery

**Issue 1.1 – Harden module discovery in Tauri backend**  
**Labels**: backend, tauri, enhancement  
**Assignee**: Person A  

- Ensure `get_available_modules`:
  - Lists only real directories under `modules/<os>/`.
  - Returns a deterministic, sorted list.
- Add or update tests for `discover_modules`.

**Done when**: `cargo test` passes and the UI shows a stable list of modules per OS.

---

**Issue 1.2 – Profile loading and validation**  
**Labels**: backend, tauri  
**Assignee**: Person A (with Person C reviewing CIS fields)  

- Ensure `get_profiles`:
  - Loads JSON from `modules/shared/profiles/*.json`.
  - Fills missing `id`/`name` from filename.
  - Errors clearly on empty/invalid JSON.
- Keep `Profile` fields aligned with CIS needs (`cisControls` etc.).

**Done when**: invalid or empty profile files are reported with readable error messages, not crashes.

---

**Issue 1.3 – Profiles and modules visible in UI**  
**Labels**: frontend, ux  
**Assignee**: Person B  

- On the Hardening tab:
  - Show a clear message if there are no modules for the current OS.
  - Show a clear message if there are no profiles.

**Done when**: the app never looks “empty with no explanation” when modules/profiles are missing.

---

### Milestone 2 – Profile-driven module selection

**Issue 2.1 – Implement profile-driven selection state**  
**Labels**: frontend, state  
**Assignee**: Person B  

- Maintain state for:
  - `selectedProfileId`
  - `selectedModules`
  - Loading/error states.
- When a profile is selected:
  - Automatically select its `modules` (intersected with available modules).
  - Allow user to toggle individual module checkboxes.

**Done when**: selecting a profile and toggling checkboxes always keeps `selectedModules` in sync.

---

**Issue 2.2 – Define pipeline payload shape**  
**Labels**: backend, frontend, api  
**Assignees**: Person A, Person B  

- Agree on the JSON payload for `run_full_sequence`, e.g.:
  - `{ profile_name: string | null, modules: string[] }`.
- Update `App.tsx` and `main.rs` to use this consistently.

**Done when**: the payload is documented in `docs/ARCHITECTURE.md` and used on both sides.

---

### Milestone 3 – `run_full_sequence` pipeline (stubbed)

**Issue 3.1 – Implement stubbed run_full_sequence command**  
**Labels**: backend, tauri, feature  
**Assignee**: Person A  

- Implement `run_full_sequence(profile_name, modules)` in Rust:
  - Simulate Snapshot → Audit → Harden → Compare for each module.
  - Return `RunResult` with per-module `steps` (stage, status, message).
- Add unit tests for happy path and “no modules” error.

**Done when**: `cargo test` passes and the command returns structured data in dev.

---

**Issue 3.2 – Wire Run Full Sequence button to backend**  
**Labels**: frontend, integration  
**Assignee**: Person B  

- Call `run_full_sequence` from the Hardening tab using:
  - `profile_name: selectedProfileId || null`
  - `modules: selectedModules` (or all modules if none manually selected).
- Handle loading and error states in the button and UI.

**Done when**: clicking the button triggers the command and shows either results or an error.

---

### Milestone 4 – Results visualization

**Issue 4.1 – Build Sequence Results panel**  
**Labels**: frontend, ux  
**Assignee**: Person B  

- Under the Hardening tab:
  - Show modules with their steps, status tags, and messages.
  - Handle empty-result cases cleanly.

**Done when**: a viewer can see for each module what happened at each stage.

---

### Milestone 5 – CIS benchmark integration & profiles

**Issue 5.1 – Expand CIS-based profiles from spreadsheets**  
**Labels**: docs, security, cis  
**Assignee**: Person C  

- Use:
  - `res/CIS Benchmark of Windows for Hardening purpose.xlsx`
  - `res/cis_ubuntu_24.04_recommendations.xlsx`
- Select additional high-impact controls and:
  - Update profile JSONs with more `cisControls`.
  - Update `docs/CIS_MAPPING.md` with new mappings.

**Done when**: at least one Windows and one Ubuntu profile reference a richer CIS control set, documented in `CIS_MAPPING.md`.

---

### Milestone 6 – Real tool integration (first steps)

**Issue 6.1 – Integrate at least one real Linux check**  
**Labels**: backend, linux, security  
**Assignee**: Person A  

- From `run_full_sequence`, call a Linux script or command (e.g., firewall or SSH check) and map its result to one step.

**Done when**: on Linux, one stage is based on real system data and still returns a valid `RunResult`.

---

**Issue 6.2 – Integrate at least one real Windows check**  
**Labels**: backend, windows, security  
**Assignee**: Person A  

- From `run_full_sequence`, call a PowerShell command or helper binary (e.g., firewall or RDP check) and map its result to one step.

**Done when**: on Windows, one stage is based on real system data and still returns a valid `RunResult`.

---

### Milestone 7 – Network & AI Advisor tabs

**Issue 7.1 – Upgrade Network tab backend & UI**  
**Labels**: backend, frontend, network  
**Assignees**: Person A, Person B  

- Backend:
  - Extend `get_network_checks` with 3–5 meaningful checks.
- Frontend:
  - Render checks as cards with titles, status badges, and descriptions.

**Done when**: the Network tab shows a small but realistic set of checks for demo.

---

**Issue 7.2 – Upgrade AI Advisor recommendations**  
**Labels**: backend, frontend, ai  
**Assignees**: Person A, Person B, Person C  

- Backend:
  - Make `get_ai_recommendations` reference modules and CIS-style controls more explicitly.
- Frontend:
  - Display recommendations as cards with severity and related modules.

**Done when**: after a run, the AI tab shows 2–3 recommendations that clearly explain what to improve.

---

### Milestone 8 – Testing & CI

**Issue 8.1 – Strengthen Rust tests**  
**Labels**: testing, backend  
**Assignee**: Person C (with A)  

- Add tests for:
  - New behaviors inside `run_full_sequence`.
  - Any expanded logic in `get_network_checks` / `get_ai_recommendations`.

**Done when**: `cargo test` covers the new code paths and still passes.

---

**Issue 8.2 – Strengthen frontend tests**  
**Labels**: testing, frontend  
**Assignee**: Person C (with B)  

- Extend `App.test.tsx` to:
  - Assert error display when `invoke` fails.
  - Assert Network and AI tabs render expected content from mocked data.

**Done when**: `npm test` covers core flows: selecting profiles, running sequences, and viewing other tabs.

---

**Issue 8.3 – Lock in CI for PRs**  
**Labels**: ci, meta  
**Assignee**: Person C  

- Ensure `.github/workflows/ci.yml` is updated if commands change.
- Enable branch protection so PRs must be green in CI before merge.

**Done when**: GitHub blocks merging PRs that fail CI.

---

### Milestone 9 – Demo polish

**Issue 9.1 – Final UI and copy polish**  
**Labels**: frontend, ux, docs  
**Assignee**: Person B (with all reviewing)  

- Refine spacing, colors, and typography across all tabs.
- Improve text so it:
  - Briefly explains each feature.
  - Mentions CIS/NIST where relevant.

**Done when**: the app looks clean and professional for evaluators.

---

**Issue 9.2 – Write demo script for final presentation**  
**Labels**: docs, demo  
**Assignee**: Person C  

- Create `docs/DEMO_SCRIPT.md` describing:
  - Exact steps to run the app.
  - What to click and what story to tell (profiles → run sequence → network → AI).

**Done when**: any team member can follow the script to give a 5–10 minute demo without confusion.

