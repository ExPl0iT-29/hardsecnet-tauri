## Person C – Testing, CI, Docs & CIS owner

You ensure the project stays verifiable, documented, and aligned to CIS benchmarks.

### Your primary roadmap issues

- **Issue 5.1** – Expand CIS-based profiles from spreadsheets.
- **Issue 8.1** – Strengthen Rust tests (with Person A).
- **Issue 8.2** – Strengthen frontend tests (with Person B).
- **Issue 8.3** – Lock in CI and branch protection.
- **Issue 9.2** – Demo script for final presentation.

### Core files you should work in

- `docs/CIS_MAPPING.md`
- `docs/IMPLEMENTATION_STATUS.md`
- `docs/ARCHITECTURE.md`
- `.github/workflows/ci.yml`
- `src/App.test.tsx`
- `src-tauri/src/main.rs` (test module)
- `modules/shared/profiles/*.json`

### Responsibilities

- Convert spreadsheet controls into practical profile mappings:
  - `res/CIS Benchmark of Windows for Hardening purpose.xlsx`
  - `res/cis_ubuntu_24.04_recommendations.xlsx`
- Keep docs current with actual code state.
- Increase test coverage for critical flows:
  - Profile loading and module discovery
  - Run sequence behavior
  - Network and AI tab rendering/error states
- Keep CI strict and green before merges.

### Definition of done for your PRs

- `cargo test` passes.
- `npm test` passes.
- CI workflow passes in PR.
- Docs updated whenever behavior/schema changes.

