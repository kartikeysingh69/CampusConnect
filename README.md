# 🎓 CampusConnect — Enterprise Campus Placement & Job Recruitment Platform

[![CampusConnect CI/CD Pipeline](https://github.com/kartikeysingh69/CampusConnect/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/kartikeysingh69/CampusConnect/actions/workflows/ci-cd.yml)
[![Docker](https://img.shields.io/badge/Docker-Multi--stage%20Builds-blue?logo=docker)](https://www.docker.com/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x%20LTS-green?logo=node.js)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.x%20Vite-61DAFB?logo=react)](https://react.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.4%20LTS-orange?logo=mysql)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

> A modern, full-stack recruitment and campus placement system engineered with production-grade DevOps best practices, automated CI/CD pipelines, containerization, and zero-cost cloud architecture.

---

## 🚀 DevOps Engineering Roadmap

| Phase | Core Focus | Technologies | Documentation |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **Foundations** | Linux, Bash Automation, Git, MySQL 10-table Schema | [Phase 1 Guide](docs/PHASE_1_LINUX_GIT.md) |
| **Phase 2** | **Containerization** | Docker, Multi-Stage Builds, Docker Compose, Volumes, Networks | [Phase 2 Guide](docs/PHASE_2_DOCKER.md) |
| **Phase 3** | **CI/CD Automation** | GitHub Actions, Unit Testing (`node:test`), GHCR Container Registry | [Phase 3 Guide](docs/PHASE_3_CICD.md) |
| **Phase 4** | **Cloud Computing** | AWS EC2 (t3.micro), VPC, Security Groups, S3 Encrypted Storage, IAM | [Phase 4 Guide](docs/PHASE_4_CLOUD_COMPUTING.md) |

---

## ⚡ Quick Start (Docker Desktop)

Run the entire multi-container stack with a single command:

```bash
# Clone the repository
git clone https://github.com/kartikeysingh69/CampusConnect.git
cd CampusConnect

# Build and start all services in the background
docker compose up -d
```

### 🌐 Live Service URLs:
- **Frontend SPA (Nginx Alpine)**: [http://localhost:80](http://localhost:80)
- **Backend API (Node.js Express)**: [http://localhost:5001](http://localhost:5001)
- **Backend Health Check**: [http://localhost:5001/api/health](http://localhost:5001/api/health)
- **MySQL 8.4 Server**: `localhost:3307` (`root:root`)

---

## 🧪 Automated Testing & CI/CD Pipeline

Our CI/CD pipeline runs automatically on every `git push` to `main`:

```bash
# Run local CI test suite
./scripts/ci_test.sh

# Or run tests individually
npm test                # Backend unit tests (node:test)
npm test --prefix frontend  # Frontend build verification (Vite)
```

### 📦 Pull Published Containers from GitHub Container Registry (GHCR):
```bash
docker pull ghcr.io/kartikeysingh69/campusconnect-backend:latest
docker pull ghcr.io/kartikeysingh69/campusconnect-frontend:latest
```

---

## 📚 Viva & Defense Resources
- [Viva Defense Questions & Answers](docs/VIVA_DEFENSE_QUESTIONS.md)
- [Architecture & Database Schemas](docs/ARCHITECTURE_DIAGRAMS.md)
- [Complete Project Report](docs/PROJECT_REPORT.md)
