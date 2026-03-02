## Introduction
HardSecNet is a dual-OS adaptive security framework designed to automate auditing, hardening, and monitoring across Linux and Windows desktop environments. It integrates system-level scripting with role-based configuration profiles, machine state snapshotting, and AI-based explainable security recommendations. The framework is built to detect configuration drifts and provide real-time insights through a planned React dashboard. This document outlines all prerequisites, security standards, tools, and technical foundations required for development, testing, and deployment, based on the project's methodology and technology stack.

This includes security standards (CIS, NIST), Linux-specific tools (SELinux, AppArmor, Lynis), AI tools (Ollama), scripting languages (Bash, PowerShell), development tools (Rust, Flask, React), and setup instructions. These are derived from the project's requirements for cross-platform compatibility, local processing, and alignment with industry best practices.

## Security Standards
The framework relies on established security standards to ensure compliance and effectiveness. These serve as the baseline for hardening and auditing scripts.

### Center for Internet Security (CIS) Benchmarks
- **Description**: CIS provides consensus-based, vendor-agnostic security configuration guides for operating systems, applications, and devices. We use CIS Level 1 profiles for desktops to balance security with usability.
- **Relevance to HardSecNet**: Forms the core of hardening scripts. For Linux (Ubuntu 24.04 Desktop Level 1): Enables UFW firewall, disables root SSH login, sets password policies (min 12 chars, max 90 days), hardens kernel params (e.g., disable ICMP redirects), secures file permissions, and configures GUI screen locks. For Windows (Windows 11 Desktop Level 1): Enables firewall, disables default accounts, enforces UAC, disables RDP, restricts file permissions, and sets login banners.
- **Prerequisites**: Download free CIS benchmarks from https://www.cisecurity.org/benchmarks. No installation needed—referenced in scripts for manual or automated application.
- **Integration**: Scripts check and apply rules (e.g., `ufw enable` on Linux, `Set-NetFirewallProfile` on Windows). Tested for compliance with before/after audits.

### National Institute of Standards and Technology (NIST) Guidelines
- **Description**: NIST provides frameworks like SP 800-53 (Security Controls) and SP 800-128 (Configuration Management) for risk assessment, configuration control, and vulnerability management.
- **Relevance to HardSecNet**: Aligns with NIST SP 800-53 for controls like CM-2 (baselines), RA-5 (vulnerability scanning), and AC-6 (least privilege). Drift detection supports CM-3 (change control), and AI recommendations enhance RA-3 (risk assessment). For AI, follows NIST AI RMF for transparency and risk management.
- **Prerequisites**: Access free NIST publications from https://www.nist.gov/cyberframework. No tools required—used as reference for design.
- **Integration**: Hardening maps to NIST CM-7 (least functionality) by disabling unused services; audits support SI-4 (system monitoring). Tested with flow to ensure revert mechanisms meet CP-10 (recovery).

## Linux Security Tools
These tools are prerequisites for Linux hardening, auditing, and mandatory access control, integrated into the framework's scripts.

### SELinux (Security-Enhanced Linux)
- **Description**: A kernel-level mandatory access control (MAC) system that confines programs to minimum privileges, preventing unauthorized actions.
- **Relevance to HardSecNet**: Considered for advanced hardening (e.g., enforcing policies on Red Hat-based systems). Not core for Ubuntu (which uses AppArmor), but can be enabled for additional security layers.
- **Prerequisites**: Installed by default on SELinux-enabled distros (e.g., Fedora). Install on Ubuntu: `sudo apt install selinux-utils policycoreutils`, then `sudo setenforce 1` to enable.
- **Integration**: In hardening, check status with `sestatus` and enforce if enabled. Tested on VMs to confine apps like browsers, aligning with NIST AC-6.

### AppArmor
- **Description**: A Linux kernel security module that confines programs with per-app profiles, restricting file access, network, and capabilities.
- **Relevance to HardSecNet**: Core for Ubuntu hardening (CIS 1.6.x). Enables and enforces profiles for key services to prevent exploits.
- **Prerequisites**: Pre-installed on Ubuntu. Check with `sudo aa-status`, enable profiles with `sudo aa-enforce /etc/apparmor.d/*`.
- **Integration:** In `hardener.sh`, ensure AppArmor is active and profiles enforced (e.g., for SSH). Tested with `aa-status` in audits to confirm confinement, supporting NIST AC-3.

### Lynis
- **Description**: An open-source auditing tool for Linux/Unix systems, scanning for vulnerabilities, misconfigurations, and compliance with CIS/NIST.
- **Relevance to HardSecNet**: Planned for advanced auditing (CIS 5.1.x) to supplement our script-based scans, providing scores and detailed reports.
- **Prerequisites**: Install with `sudo apt install lynis`. Run as `sudo lynis audit system`.
- **Integration**: Will parse Lynis output into JSON for AI analysis (e.g., warnings as key-value pairs). Tested in prototypes for compliance scoring, aligning with NIST RA-5.

## Other Tools and Technologies
These cover AI, scripting, development, and testing prerequisites.

### AI Tools
- **Ollama**: Open-source LLM server for local AI.
  - **Relevance**: Runs Phi-3 model for explainable recs (e.g., analyzing audit JSON).
  - **Prerequisites**: Install with `curl https://ollama.ai/install.sh | sh`, pull model `ollama pull phi3`, run `ollama serve &`.
  - **Integration**: Called via `curl` (Linux) or `ollama-rs` (Windows) with prompts like “Analyze audit for risks.”

### Scripting and UI Tools
- **Bash**: For Linux scripts and TUI.
  - **Relevance**: Handles auditing/hardening, with `dialog` for TUI (yes/no prompts).
  - **Prerequisites**: Pre-installed on Linux. Install `dialog` with `sudo apt install dialog`.
- **PowerShell**: For Windows scripts.
  - **Relevance**: Native for auditing/hardening (e.g., `Set-NetFirewallProfile`).
  - **Prerequisites**: Pre-installed on Windows 11. Run with `-ExecutionPolicy Bypass`.
- **Rust**: For Windows GUI.
  - **Relevance**: Builds GUI with `eframe/egui` for buttons/output.
  - **Prerequisites**: Install from rust-lang.org. For cross-compile from Linux: `rustup target add x86_64-pc-windows-msvc`, `sudo apt install mingw-w64`.
- **`jq`**: JSON processor.
  - **Relevance**: Parses/compares audit JSON in Linux.
  - **Prerequisites**: `sudo apt install jq` (Linux); Chocolatey install on Windows.

### Development and Testing Tools
- **Flask**: Python REST API backend (planned).
  - **Prerequisites**: `pip install flask`, for data syncing.
- **React.js**: Frontend dashboard (planned).
  - **Prerequisites**: Node.js, `npm install react axios chart.js tailwindcss`.
- **Postman**: API testing.
  - **Prerequisites**: Download from postman.com.
- **GitHub**: Version control.
  - **Prerequisites**: Account at github.com.
- **VS Code**: IDE.
  - **Prerequisites**: Download from code.visualstudio.com.
- **VirtualBox/VMware**: Testing VMs.
  - **Prerequisites**: Download from oracle.com or vmware.com for Ubuntu/Windows VMs.

### Setup Instructions
1. **Linux (Ubuntu 24.04)**:
   - Security Tools: `sudo apt install selinux-utils policycoreutils apparmor-utils lynis`.
   - Dev Tools: `sudo apt install dialog curl jq`.
   - Ollama: `curl https://ollama.ai/install.sh | sh; ollama pull phi3; ollama serve &`.
   - Run: `chmod +x *.sh scripts/*.sh; ./indusafe.sh`.

2. **Windows (Windows 11)**:
   - Security Tools: Use built-in `auditpol`, registry editor.
   - Dev Tools: Install Rust (rust-lang.org), Visual Studio Build Tools (visualstudio.microsoft.com).
   - Ollama: Download from ollama.com, `ollama pull phi3`, `ollama serve`.
   - Run: `cargo build --release; .\target\release\indusafe-windows.exe`.

3. **Cross-Platform Testing**:
   - Use VMs to isolate (e.g., snapshot before hardening).
   - Verify CIS/NIST: Run Lynis or `auditpol` post-hardening.

---

### References
- CIS Benchmarks: https://www.cisecurity.org/benchmarks (Ubuntu/Windows Desktop Level 1).
- NIST Guidelines: https://www.nist.gov/cyberframework (SP 800-53, AI RMF).
- SELinux Docs: https://selinuxproject.org/page/Main_Page.
- AppArmor Docs: https://apparmor.net/.
- Lynis: https://cisofy.com/lynis/.
- Ollama: https://ollama.ai/docs.
- Rust eframe: https://crates.io/crates/eframe.
- Ubuntu Hardening Repo: https://github.com/AndyHS-506/Ubuntu-Hardening.

This document covers all prerequisites and foundations. No need for the synopsis again—it's integrated where relevant. If you want expansions or sections added, let me know, bro!