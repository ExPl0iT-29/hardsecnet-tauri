# HardSecNet Tauri desktop app

hardsecnet-tauri is a cross-platform desktop app built with **Tauri + Rust** on the backend and **React + TypeScript + Vite** on the frontend. It orchestrates security hardening workflows inspired by CIS and NIST guidance.

The app:

- Discovers OS-specific hardening **modules** from the local `modules/` tree.
- Loads **profiles** (Windows / Ubuntu) from JSON under `modules/shared/profiles/`.
- Runs a stubbed **Snapshot → Audit → Harden → Compare** pipeline over selected modules.
- Exposes a **Network** tab (placeholder checks) and an **AI Advisor** tab (stubbed recommendations) ready for deeper integration.

## Getting started

1. Install dependencies:
   - `npm install`
2. Run in development:
   - `npm run tauri dev`
3. Build:
   - `npm run build`
   - `cd src-tauri && cargo build`

For contributor workflow, see:

- `docs/CONTRIBUTING.md` – how to branch, commit, and run checks.
- `docs/ARCHITECTURE.md` – overview of commands, modules, and profiles.
- `docs/CIS_MAPPING.md` – how CIS benchmarks from `res/*.xlsx` map into profiles.
- `docs/DEVELOPMENT_GUIDE.md` – day-to-day steps for the 3-person team.
- `docs/IMPLEMENTATION_STATUS.md` – summary of what’s currently implemented.
- `docs/AI_DEV_TOOLS.md` – AI/dev tooling suggestions to build faster.
