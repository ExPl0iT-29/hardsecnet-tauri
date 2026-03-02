## CIS mapping for hardsecnet-tauri

This document explains how the CIS benchmark spreadsheets in `res/` map into profiles and modules in the Tauri app.

### Source benchmarks

- `res/CIS Benchmark of Windows for Hardening purpose.xlsx`
  - Windows 11 Desktop Level 1 style guidance.
  - Focus: firewall, account policies, UAC, RDP, and baseline OS hardening.
- `res/cis_ubuntu_24.04_recommendations.xlsx`
  - Ubuntu 24.04 Desktop Level 1 recommendations.
  - Focus: UFW firewall, SSH hardening, file permissions, AppArmor, and system policies.

These spreadsheets are **authoritative references**. The app does not parse them directly; instead, we manually select representative controls.

### Profiles derived from CIS

Profiles live in `modules/shared/profiles/*.json` and contain:

- `id` – internal identifier (e.g., `default_org_windows`, `cis_ubuntu_desktop`).
- `name` – what appears in the UI.
- `os` – `"windows"` or `"linux"`.
- `description` – short human-readable explanation.
- `modules` – list of module names that will be run for that profile.
- `cisControls` – list of CIS control IDs relevant to this profile.

Current example profiles:

- `modules/shared/profiles/default_org.json`
  - Targets Windows desktops (`os: "windows"`).
  - `modules`: `baseline_snapshot`, `cis_audit`, `baseline_harden`, `drift_check`.
  - `cisControls` values reference Firewall, account policy, and remote access controls from the Windows CIS spreadsheet.
- `modules/shared/profiles/cis_ubuntu_desktop.json`
  - Targets Ubuntu desktops (`os: "linux"`).
  - Uses the same module set as above, but the underlying scripts/checklists are expected to align with Ubuntu CIS sections (UFW, SSH, etc.).

### Modules and CIS coverage

Modules under `modules/<os>/` are **placeholders for now** but are intended to roughly cover:

- `baseline_snapshot`
  - Snapshot system state before changes.
  - Mapped CIS ideas: \"document baseline configuration\" and snapshot-before-hardening best practices.
- `cis_audit`
  - Run a series of checks (or tools like Lynis/auditpol) to compare the system state against CIS recommendations.
  - Mapped CIS sections: specific rules from the spreadsheets (e.g., firewall, SSH, password policy).
- `baseline_harden`
  - Apply actual changes to move the system closer to CIS compliance.
  - Uses scripts or commands corresponding to the benchmark items you select.
- `drift_check`
  - Compare current state against the hardened baseline to detect drift over time.

### How to extend CIS mapping

1. **Pick controls from the spreadsheets**
   - Open the `.xlsx` in Excel/LibreOffice.
   - Choose a manageable subset of high-impact controls (e.g., firewall, RDP/SSH, password policy).
2. **Encode them into profiles**
   - Add CIS IDs to `cisControls` in the relevant profile JSON.
   - Optionally, create new profiles (e.g., `lab_high_security.json`) with stricter sets.
3. **Implement checks/scripts per module**
   - For `cis_audit`, create scripts or Rust code that check those controls and emit JSON summaries.
   - For `baseline_harden`, implement enabling/disabling settings in line with the benchmark.
4. **Surface results in the UI**
   - Populate `RunResult` with messages referencing CIS control IDs.
   - Use the AI Advisor to generate natural-language explanations tied to those IDs.

This mapping lets you talk about CIS alignment in your final-year report while keeping the implementation practical and incremental.

