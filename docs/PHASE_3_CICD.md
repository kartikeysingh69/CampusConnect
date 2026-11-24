# Phase 3: Continuous Integration & Continuous Delivery (CI/CD) Automation

> **DevOps Core Pillar**: Automated Testing, Multi-Stage Container Image Building, and Publishing to GitHub Container Registry (GHCR) via GitHub Actions.

---

## 1. Executive Summary & Problem Solved

In traditional software development without CI/CD:
- Developers manually test code, resulting in human error and regressions escaping into production.
- Production images are built locally on developer laptops ("Works on my machine" anti-pattern).
- Deployment is manual, slow, and unversioned.

**CampusConnect Phase 3 Solution**:
A fully automated, zero-cost, enterprise-grade **GitHub Actions CI/CD Pipeline** (`.github/workflows/ci-cd.yml`):
1. **Automated Quality Gate**: Triggers immediately on every `git push` or `pull_request` to run backend unit tests (`node:test`) and frontend production build verification (`vite build`).
2. **Containerization with Layer Caching**: If tests pass, GitHub Actions spins up Docker Buildx with GitHub Actions Cache (`type=gha`), compiling multi-stage container images in seconds.
3. **Automated Registry Publishing**: Automatically tags and pushes the production images to **GitHub Container Registry (GHCR)** (`ghcr.io/kartikeysingh69/campusconnect-backend` and `campusconnect-frontend`) using native `GITHUB_TOKEN` security without third-party secrets.

---

## 2. CI/CD Architecture & Pipeline Flow

```mermaid
flowchart TD
    Developer([🧑‍💻 Developer: git push origin main]) -->|Webhook Event| GHA[🐙 GitHub Actions Runner: ubuntu-latest]

    subgraph CI["Stage 1: Continuous Integration (Test & Quality Gate)"]
        GHA --> Checkout[1. actions/checkout@v4]
        Checkout --> SetupNode[2. actions/setup-node@v4 (Node 22.x + npm cache)]
        SetupNode --> InstallDeps[3. npm ci (Clean Dependency Install)]
        InstallDeps --> RunTests[4. npm test (Backend Unit Tests - 8/8 Passed)]
        RunTests --> FrontBuild[5. npm test --prefix frontend (Vite Bundle Verification)]
    end

    subgraph CD["Stage 2: Continuous Delivery (Docker Buildx & GHCR Publishing)"]
        FrontBuild -->|Passes Quality Gate| Buildx[6. docker/setup-buildx-action@v3]
        Buildx --> GHCRLogin[7. docker/login-action@v3 (Auth with GITHUB_TOKEN)]
        GHCRLogin --> ExtractMeta[8. docker/metadata-action@v5 (Tags: latest, sha, branch)]
        ExtractMeta --> BuildBackend[9. Build & Push Backend Image + GHA Layer Cache]
        ExtractMeta --> BuildFrontend[10. Build & Push Frontend Image + GHA Layer Cache]
        BuildBackend --> GHCR[(📦 GitHub Container Registry: ghcr.io)]
        BuildFrontend --> GHCR
    end

    subgraph Deploy["Stage 3: Production Deployment Ready"]
        GHCR --> Summary[📋 GitHub Action Step Summary]
        GHCR --> PullImage([🖥️ Any Server / VM / Kubernetes: docker pull ghcr.io/...])
    end
```

---

## 3. Workflow File Breakdown (`.github/workflows/ci-cd.yml`)

### A. Workflow Triggers
```yaml
on:
  push:
    branches: [ main ]
    paths-ignore:
      - 'README.md'
      - 'docs/**'
  pull_request:
    branches: [ main ]
  workflow_dispatch: # Allows manual trigger from GitHub UI for live examiner demo
```
- **`push: branches [main]`**: Automatically deploys production updates whenever code is merged to main.
- **`pull_request`**: Runs the test suite on PRs *without* pushing images, protecting the `main` branch from broken builds.
- **`workflow_dispatch`**: Adds a "Run workflow" button in GitHub Actions UI to trigger a live run on demand during presentations.

### B. Security & Authentication (`GITHUB_TOKEN`)
```yaml
permissions:
  contents: read
  packages: write # Required for publishing to ghcr.io
```
- Uses GitHub's built-in OIDC and ephemeral token.
- **Zero Credentials Management**: No need to store sensitive Docker Hub passwords or personal access tokens in GitHub Secrets.

### C. Docker Layer Caching (`type=gha`)
```yaml
cache-from: type=gha
cache-to: type=gha,mode=max
```
- Cache hits save up to **80% of build time** by reusing unchanged dependency layers between commits.

---

## 4. Test Suite Implementation (Zero Extra Dependencies)

CampusConnect uses Node.js's native test runner (`node:test` + `node:assert`) introduced in Node 18/20/22:

| Test File | Description | Test Cases |
| :--- | :--- | :--- |
| `tests/auth_middleware.test.js` | JWT Authentication & Route Guards | 401 on missing token, 403 on invalid token, 200 + `req.user` decoded injection on valid token |
| `tests/security_crypto.test.js` | Password Hashing & Token Integrity | Bcrypt salt rounds, password verification, JWT payload claims, and signature tampering prevention |
| `tests/api_health.test.js` | Application Initialization & Routes | Express 5 router layer stack inspection, `/` and `/api/health` registration |
| `frontend` (Vite) | Client Bundle Integrity Verification | AST transformation, tree-shaking, CSS minification, and SPA bundle generation |

### Local Test Execution:
```bash
# Run backend test suite
npm test

# Run frontend build test
npm test --prefix frontend

# Or run automated local CI replica
./scripts/ci_test.sh
```

---

## 5. Live Demonstration Guide for Examiner / Viva

When showing this project to an external examiner, follow this 4-step live demo script:

### Step 1: Show the GitHub Actions Tab
1. Open the repository on GitHub: `https://github.com/kartikeysingh69/CampusConnect`
2. Click on the **Actions** tab.
3. Point out the workflow named **CampusConnect CI/CD Pipeline**.
4. Show the green checkmark (✅) on the latest commit.

### Step 2: Inspect Job Logs & Quality Gate
1. Click on the latest workflow run.
2. Show the two linked stages:
   - **`Run Unit Tests & Build Verification`**: Show the 8 passed unit tests in the log.
   - **`Build & Push Multi-Stage Docker Images`**: Show the multi-stage build logs, layer cache hits, and GHCR push digest.
3. Click on the **Summary** tab to show the formatted Markdown deployment table generated by `$GITHUB_STEP_SUMMARY`.

### Step 3: Show GitHub Container Registry (GHCR Packages)
1. On the repository home page, look at the right sidebar under **Packages**.
2. Show the published container packages:
   - `campusconnect-backend:latest`
   - `campusconnect-frontend:latest`
3. Point out that each image is tagged with both `:latest` and the specific git commit hash (`:sha-xxxxxxx`).

### Step 4: Show Live Pull Capability
Open a terminal in front of the examiner and execute:
```bash
docker pull ghcr.io/kartikeysingh69/campusconnect-backend:latest
docker pull ghcr.io/kartikeysingh69/campusconnect-frontend:latest
```
Demonstrate that anyone in the world with access can pull the exact verified container and spin it up in seconds without having Node.js or build tools installed on their computer.

---

## 6. Top Viva Questions & Answers (Examiner Defense)

### Q1: What is CI/CD and why did you use GitHub Actions?
> **Answer**:
> **CI (Continuous Integration)** is the practice of automatically integrating code changes from multiple contributors into a shared repository several times a day. Each integration is verified by automated builds and unit tests to detect errors quickly.
> **CD (Continuous Delivery / Deployment)** automates the release process so that validated code can be deployed to staging or production environments with zero downtime.
> We chose **GitHub Actions** because it is cloud-native, directly integrated with our source repository, provides free execution runners (`ubuntu-latest`), and seamlessly connects with GitHub Container Registry (GHCR) without needing third-party API keys.

---

### Q2: What is the difference between Continuous Delivery and Continuous Deployment?
> **Answer**:
> - **Continuous Delivery**: Code automatically passes testing, building, and packaging into a release-ready artifact (e.g., Docker image in GHCR), but the final trigger to deploy to production requires manual human approval or a release tag.
> - **Continuous Deployment**: Every change that passes all stages of the production pipeline is released directly to the live customer-facing environment with zero human intervention.

---

### Q3: Why did you choose GitHub Container Registry (GHCR) over Docker Hub?
> **Answer**:
> 1. **Zero External Secrets**: GHCR uses the built-in `${{ secrets.GITHUB_TOKEN }}` created automatically for every pipeline run. Docker Hub requires generating an external Personal Access Token (PAT) and manually configuring GitHub Secrets.
> 2. **No Rate Limiting**: Docker Hub enforces a strict anonymous pull limit (100 pulls per 6 hours). GHCR has significantly higher throughput and zero-cost hosting for public repositories.
> 3. **Native Repository Integration**: Packages are displayed directly on the GitHub repository homepage under the Packages section alongside the code and release tags.

---

### Q4: How does Docker Layer Caching work in GitHub Actions?
> **Answer**:
> We configured `docker/build-push-action` with `cache-from: type=gha` and `cache-to: type=gha,mode=max`.
> GitHub Actions allocates a fast cloud cache per repository. When Docker builds an image, it checks if the preceding layers (like `COPY package.json` and `RUN npm ci`) have changed. If they haven't, Docker skips reinstalling dependencies and fetches the cached layer from the GitHub Actions cache, reducing build times from several minutes down to 20-30 seconds.

---

### Q5: What happens if a developer pushes code with a syntax error or a failing test?
> **Answer**:
> The `test` job fails immediately during `npm test` or `npm test --prefix frontend`. Because our `build-and-push` job specifies `needs: test`, GitHub Actions cancels the deployment stage. **No Docker image is built, and no broken container is pushed to the registry.** This prevents production outages through strict quality gating.

---

### Q6: What permissions are required for the GITHUB_TOKEN in this workflow?
> **Answer**:
> We grant explicit least-privilege permissions:
> - `contents: read`: Allows the workflow to check out the source code.
> - `packages: write`: Allows the workflow to push the built container images to GitHub Container Registry.
> Restricting permissions adheres to the Principle of Least Privilege (PoLP) recommended by DevSecOps best practices.
