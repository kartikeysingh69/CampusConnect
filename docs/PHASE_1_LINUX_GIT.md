# 🐧 Phase 1: Foundations (Linux, Shell Scripting & Git)

## 📌 Overview
This document outlines the complete architectural and operational foundation for the **CampusConnect** enterprise platform under **Phase 1: Foundations (Linux, Shell Scripting & Git)**. It establishes:
1. **Linux System Administration & Server Hardening**
2. **Automated Shell Scripting Suite for Operations & CI/CD**
3. **Advanced Git Version Control & Release Engineering**

---

## 1. 🐧 Linux Architecture & Systems Engineering

### 1.1 Filesystem Hierarchy Standard (FHS) in CampusConnect
On production Linux instances (e.g. Ubuntu 22.04 / 24.04 LTS), CampusConnect files are organized following strict Linux security standards:
- `/opt/campusconnect`: Core application codebase, backend API, and frontend production assets.
- `/var/log/campusconnect`: Centralized operational logs (access, error, security audit).
- `/var/backups/campusconnect`: Automated MySQL database snapshots (`.sql.gz`).
- `/etc/campusconnect/backend.env`: Environment variables with read-only permissions (`chmod 600`).
- `/etc/systemd/system/campusconnect-backend.service`: Systemd service unit descriptor.

### 1.2 Essential Linux Commands & Workflow

| Operation | Command | Purpose |
|---|---|---|
| **Process Management** | `ps aux \| grep node` / `top` / `htop` | Monitor active processes and CPU/RAM usage |
| **Port Inspection** | `ss -tulpn \| grep -E '5000\|3306\|80'` | Verify backend API, MySQL, and Nginx ports |
| **Log Tailing** | `journalctl -u campusconnect-backend -f` | Real-time follow of production server stdout/stderr |
| **File Permissions** | `chmod 750 /opt/campusconnect && chown -R deploy:deploy /opt/campusconnect` | Enforce least-privilege access |
| **Network & Firewall** | `ufw status verbose` / `ufw allow 5000/tcp` | Inspect and configure kernel packet filtering |
| **Storage & Inodes** | `df -h` / `du -sh /opt/campusconnect/*` | Monitor disk capacity and directory consumption |

---

## 2. 🐚 Automated Shell Scripting Suite (`scripts/`)

CampusConnect includes a production-ready bash automation suite engineered with POSIX safety flags (`set -euo pipefail`):

| Script | Path | Function |
|---|---|---|
| **Linux Setup** | `scripts/setup_linux.sh` | Automated server provisioner (Node 22, MySQL 8, Git, UFW firewall, kernel limits). |
| **Local Dev** | `scripts/dev.sh` | One-click developer startup with automatic dependency check and graceful SIGINT cleanup. |
| **Build & Bundle** | `scripts/build.sh` | Compiles Vite frontend, validates syntax, and packages production output in `dist/`. |
| **DB Backup** | `scripts/db_backup.sh` | Runs `mysqldump` with gzip compression, SHA-256 integrity hash, and 7-day retention pruning. |
| **Health Check** | `scripts/healthcheck.sh` | Probes `/api/health`, tests DB connection, checks disk threshold, and outputs standard exit codes. |
| **Deploy** | `scripts/deploy.sh` | Zero-downtime deployment script: git pull, install, build, migrate, and systemd reload. |
| **Git Release** | `scripts/git_release.sh` | Validates working tree, generates semantic version tags (e.g. `v2.4.0`), and pushes to origin. |

### 2.1 Making Scripts Executable (Linux/macOS)
```bash
chmod +x scripts/*.sh
```

---

## 3. 🐙 Git Architecture & Version Control Strategy

### 3.1 Repository Details
- **Remote URL:** `https://github.com/kartikeysingh69/CampusConnect.git`
- **Primary Branch:** `main` (Production-ready, protected branch)
- **Feature Branch Pattern:** `feature/<phase-name>` (e.g., `feature/phase-1-foundations`)
- **Semantic Versioning:** `vMAJOR.MINOR.PATCH` (e.g., `v2.4.0`)

### 3.2 Git Branching Workflow (Git Flow)
```
  [main] ─────────────────────●──────────────● (Release v2.4.0)
                               ▲              ▲
  [develop] ──────●────────────┴──────●───────┘
                   ▲                  ▲
  [feature] ───────┴ (feature/devops)─┘
```

### 3.3 Conventional Commit Standards
All commits follow structured semantic conventions:
- `feat: <description>` — New feature (e.g., `feat: add in-browser coding assessment`)
- `fix: <description>` — Bug fix (e.g., `fix: resolve assessment job_id null constraint`)
- `refactor: <description>` — Code change that neither fixes a bug nor adds a feature
- `docs: <description>` — Documentation only (e.g., `docs: update Phase 1 Linux guide`)
- `chore: <description>` — Build process, dependencies, or auxiliary tools

### 3.4 Pre-Commit Security Hooks
The repository includes `.githooks/pre-commit` to ensure:
- Zero credential leakage (scans for raw JWT secrets, database passwords, and private keys).
- Validation of staged JavaScript syntax before commit finalization.

To activate pre-commit hooks in your local clone:
```bash
git config core.hooksPath .githooks
```

---

## 4. 🚀 Quick Start Commands (Phase 1 Execution)

### Local Dev Run:
```bash
bash scripts/dev.sh
```

### Automated Health Verification:
```bash
bash scripts/healthcheck.sh
```

### Automated Database Backup:
```bash
bash scripts/db_backup.sh
```

### Production Build:
```bash
bash scripts/build.sh
```

---

## 5. 🎯 Viva & Technical Defense Questions (Foundations)

1. **Q: Why do we use `set -euo pipefail` at the start of bash scripts?**
   - **A:** 
     - `-e` (errexit): Immediately exits if any command returns a non-zero exit code.
     - `-u` (nounset): Treats unset variables as an error and exits immediately.
     - `-o pipefail`: Prevents errors in a pipeline from being masked by the last command's status.

2. **Q: How does the systemd service ensure high availability?**
   - **A:** Through `Restart=always` and `RestartSec=5`, if Node.js encounters an uncaught exception or crash, systemd automatically restarts the process within 5 seconds without manual intervention.

3. **Q: What is the benefit of SHA-256 checksums in automated backups?**
   - **A:** It guarantees data integrity against silent disk corruption or incomplete network transfers before restoring critical student placement records.
