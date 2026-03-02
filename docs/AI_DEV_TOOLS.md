## AI and tooling to move faster (2026)

This document lists practical AI-powered tools and workflows you can use to **develop, test, and ship hardsecnet-tauri faster**.

> Always keep code reviews and tests in the loop. AI should accelerate you, not replace your judgment.

### 1. AI coding assistants (IDE)

- **Cursor** (what you’re using now)
  - Strengths:
    - Deep repo awareness, good at multi-file refactors.
    - Inline completions and chat grounded in your codebase.
  - How to use for this project:
    - Generate boilerplate for new Tauri commands or React components.
    - Ask it to write tests (Vitest / Rust) for functions you just added.
    - Use it for quick code reviews before opening a PR.
- **GitHub Copilot / Copilot in VS Code**
  - Strengths:
    - Strong autocompletion and short code generation.
    - PR review comments and test suggestion features.
  - How to use:
    - While typing Rust or TS, let it suggest function bodies or type definitions.
    - Use Copilot’s “Explain this code” or “Propose tests” inside PRs.
- **Other IDE assistants (optional)**
  - **Codeium, Windsurf, etc.**
    - Similar feature set: inline suggestions, chat, refactor templates.
    - Use whichever integrates best with your editor and workflow.

### 2. AI-assisted code review & PRs

- **GitHub PR review bots**
  - Examples: AI-based review actions or Copilot PR review.
  - Benefits:
    - Catch style issues, duplicated logic, or missed tests quickly.
    - Provide natural-language summaries of PRs for teammates.
  - How to use:
    - Enable on your repo (if available) to automatically review new PRs.
    - Still keep at least one human review for architectural decisions.
- **Automated changelog / summary tools**
  - Some bots can generate release notes and summaries for big merges.
  - Use them near submission time to produce a clean “what changed” story.

### 3. AI for testing and quality

- **Test generation helpers (using IDE AI)**
  - Ask the assistant to:
    - “Write unit tests for `load_profiles` in `main.rs`.”
    - “Write Vitest tests that mock `invoke` and cover profile selection edge cases.”
  - Then:
    - Review generated tests.
    - Simplify and keep only what adds value.
- **Static analysis & linters (non-AI but critical)**
  - Rust:
    - `cargo clippy` – catches common mistakes and anti-patterns.
  - Frontend:
    - `eslint` with TypeScript and React hooks rules.
  - How AI helps:
    - Ask AI to explain specific lints or clippy warnings and how to fix them cleanly.

### 4. AI for documentation and reports

- **Doc drafting**
  - Use AI to:
    - Turn bullet points into polished sections for your final-year report.
    - Generate architecture diagrams (in Mermaid) based on your code.
  - Workflow:
    - Paste short snippets of code or high-level descriptions, not the whole repo.
    - Let the model propose text, then you edit for accuracy and tone.
- **Mapping CIS/NIST text → profiles**
  - Paste small portions of your CIS `.xlsx` content (or summaries) and ask:
    - “Suggest JSON profile fields for these controls.”
  - Use the output as a starting point for `cisControls` and descriptions.

### 5. AI for shell and scripting (careful use)

- For Linux and Windows scripts you’ll later call from Tauri:
  - Ask AI to draft:
    - Audit scripts (e.g., check firewall, SSH, RDP).
    - Hardening scripts that align with specific CIS controls.
  - Always:
    - Review scripts line-by-line.
    - Test in VMs or disposable environments before using on real machines.

### 6. Non-AI tools that still boost speed

- **`cargo watch`** (backend)
  - Automatically re-runs tests or builds when Rust files change.
  - Example: `cargo watch -x test` while working on `main.rs`.
- **Vite dev server** (frontend)
  - `npm run dev` gives instant reload for UI changes.
- **GitHub Actions** (already configured)
  - Runs tests and lints on every push/PR.
  - Use CI failures as your first “reviewer” before asking your teammates.

### 7. How your team should use AI together

- Agree on guidelines:
  - Never accept AI-generated code without at least one human review.
  - Always run tests (`cargo test`, `npm test`, `npm run lint`) after large AI changes.
  - Keep sensitive data (API keys, internal URLs) out of prompts.
- Split usage by role:
  - **Person A**: generate Rust boilerplate, shell/PowerShell scripts, and test scaffolding.
  - **Person B**: generate React components, Tailwind class suggestions, and test cases.
  - **Person C**: generate doc drafts, mapping tables for CIS, and CI workflow skeletons.

Used well, these tools give you **speed + confidence** instead of just more code. Combine them with your existing docs and tests for a strong final-year project.

