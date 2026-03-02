## Contributing to hardsecnet-tauri

This project is a Tauri (Rust) + React + TypeScript desktop application that acts as the HardSecNet orchestration UI. The goal is to keep the codebase simple, secure, and easy to extend.

### Prerequisites

- **Rust** (latest stable) with `cargo` on your PATH.
- **Node.js** (LTS) with `npm`.
- **Tauri CLI** installed globally: `cargo install tauri-cli`.

### Getting started

1. **Clone and install**
   - `git clone <repo-url>`
   - `cd hardsecnet-tauri`
   - `npm install`
2. **Run in development**
   - `npm run tauri dev`
3. **Build**
   - `npm run build` (builds the React app)
   - `cd src-tauri && cargo build` (builds the Rust side)

### Branching and workflow

- Main branch: `main` should always be in a working state.
- Create feature branches off `main`:
  - `feature/backend-run-sequence`
  - `feature/frontend-results-panel`
  - `chore/tests-and-ci`
- Open a pull request referencing the GitHub issue you are working on.
- At least **one review** is required before merging to `main`.

### Code style and checks

- **Rust**
  - Format: `cargo fmt`
  - Lints: `cargo clippy --all-targets --all-features -- -D warnings`
- **Frontend**
  - Type-check + build: `npm run build`
  - (Optional) Linting and tests will be wired via `npm run lint` / `npm test` once configured.

Before pushing, make sure:

- `npm run build` passes.
- `cd src-tauri && cargo test` passes.

### Commit messages

- Use short, descriptive messages:
  - `feat: add run_full_sequence command`
  - `fix: handle empty profile JSON`
  - `docs: add CIS mapping`

