## Person A – Backend & Tauri owner

You own all Rust/Tauri backend work and keep the command layer stable for the frontend.

### Your primary roadmap issues

- **Issue 1.1** – Harden module discovery.
- **Issue 1.2** – Profile loading and validation.
- **Issue 2.2** – Pipeline payload shape (with Person B).
- **Issue 3.1** – Implement/extend `run_full_sequence`.
- **Issue 6.1** – Real Linux check integration.
- **Issue 6.2** – Real Windows check integration.
- **Issue 7.1** – Network checks backend part.
- **Issue 7.2** – AI recommendations backend part.

### Core files you should work in

- `src-tauri/src/main.rs` (main command implementations)
- `modules/windows/*` and `modules/linux/*` (module folders/scripts)
- `modules/shared/profiles/*.json` (if schema changes are needed)

### Responsibilities

- Keep command APIs stable and typed:
  - `get_available_modules`
  - `get_profiles`
  - `run_full_sequence`
  - `get_network_checks`
  - `get_ai_recommendations`
- Convert script/OS failures into clean error messages (no panics).
- Keep `RunResult` shape stable so frontend does not break.
- Add/maintain Rust tests for every behavior change.

### Definition of done for your PRs

- `cargo fmt` clean.
- `cargo clippy -- -D warnings` clean.
- `cargo test` passes.
- Any API change is reflected in docs (`docs/ARCHITECTURE.md`).

