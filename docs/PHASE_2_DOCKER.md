# 🐳 Phase 2: Containerization (Docker Architecture & Multi-Stage Builds)

## 📌 Overview
Containerization is the foundational backbone of modern DevOps workflows. In **Phase 2**, the **CampusConnect** application is completely containerized following enterprise standards:
1. **Docker Core Concepts:** Images, Containers, Volumes, and Networks.
2. **Dockerfile Best Practices:** Multi-stage builds reducing image size by >97% (<25MB).
3. **Docker Compose:** Coordinated multi-container orchestration (MySQL 8.4 DB + Node.js 22 API + Nginx Alpine SPA).
4. **Data Durability & Isolation:** Named volumes for MySQL & resumes, isolated custom bridge network.

---

## 1. 🧱 Docker Core Architecture

```
                    ┌──────────────────────────────────────────────┐
                    │       Docker Host (campusconnect_network)    │
                    │                                              │
                    │  ┌──────────────┐         ┌───────────────┐  │
                    │  │   frontend   │         │    backend    │  │
    Client Browser  │  │(Nginx Alpine)│──/api/─►│(Node 22 LTS) │  │
   (Port 80/443) ──►│  │  Port 80     │         │   Port 5000   │  │
                    │  └──────────────┘         └───────┬───────┘  │
                    │                                   │          │
                    │                           (Port 3306)        │
                    │                                   ▼          │
                    │                           ┌───────────────┐  │
                    │                           │   mysql-db    │  │
                    │                           │  (MySQL 8.4)  │  │
                    │                           └───────┬───────┘  │
                    └───────────────────────────────────┼──────────┘
                                                        │
                                                        ▼
                                        ┌───────────────────────────────┐
                                        │ Named Volume: mysql_data      │
                                        │ Named Volume: uploads_data    │
                                        └───────────────────────────────┘
```

### 1.1 The 4 Core Primitives:

| Primitive | Definition | CampusConnect Implementation |
|---|---|---|
| **Images** | Immutable, read-only template with layered union file system (OverlayFS). | `campusconnect-frontend:latest` (<25MB), `campusconnect-backend:latest` (~85MB), `mysql:8.4`. |
| **Containers** | Isolated, runnable user-space instance of an image sharing the host Linux kernel (cgroups & namespaces). | `campusconnect-frontend`, `campusconnect-backend`, `campusconnect-mysql`. |
| **Volumes** | Dedicated storage decoupled from container lifecycle stored on host `/var/lib/docker/volumes`. | `campusconnect_mysql_data` (preserves DB data), `campusconnect_uploads_data` (resumes). |
| **Networks** | Virtual software-defined networks providing isolation and automatic DNS service discovery. | `campusconnect_network` (custom bridge driver). |

---

## 2. ⚡ Dockerfile Best Practices & Multi-Stage Builds

### 2.1 The Problem with Single-Stage Builds
In traditional single-stage Docker builds, development compilers (`npm`, `build-essential`, `python`, source code, devDependencies) are shipped directly into the production container.
- Resulting Image Size: **~1.1 GB**
- Attack Surface: **High** (build tools and package managers can be exploited).

### 2.2 The Multi-Stage Solution
Multi-stage builds use multiple `FROM` instructions in a single `Dockerfile`. Intermediate build dependencies and artifacts are discarded; only the final production binary/bundle is copied into the minimal runner image.

#### 📊 Size Comparison (CampusConnect Frontend):
- Single-Stage Node Image: **~1,050 MB**
- Multi-Stage Nginx Alpine: **~22.4 MB** (**>97% Size Reduction!**)

#### 📊 Size Comparison (CampusConnect Backend):
- Full Ubuntu/Node Image: **~1,200 MB**
- Multi-Stage Node 22 Alpine: **~84 MB**

### 2.3 Frontend Multi-Stage Architecture ([frontend/Dockerfile](file:///d:/mini%20project/frontend/Dockerfile)):
```dockerfile
# Stage 1: Build React Assets
FROM node:22-alpine AS builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci --no-audit --no-fund
COPY frontend ./
RUN npm run build

# Stage 2: Production Nginx Server (<25MB)
FROM nginx:1.27-alpine AS runner
COPY --from=builder /app/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget --spider http://localhost/health || exit 1
CMD ["nginx", "-g", "daemon off;"]
```

### 2.4 Backend Multi-Stage Architecture ([backend/Dockerfile](file:///d:/mini%20project/backend/Dockerfile)):
```dockerfile
# Stage 1: Dependencies Isolation
FROM node:22-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund

# Stage 2: Minimal Production Runtime
FROM node:22-alpine AS runner
WORKDIR /app
RUN apk add --no-cache wget ca-certificates
COPY --from=dependencies /app/node_modules ./node_modules
COPY package*.json ./
COPY backend ./backend
RUN mkdir -p backend/uploads/resumes && chown -R node:node /app
USER node
ENV NODE_ENV=production PORT=5000
EXPOSE 5000
HEALTHCHECK --interval=30s --timeout=5s CMD wget --spider http://localhost:5000/api/health || exit 1
CMD ["node", "backend/server.js"]
```

### 2.5 Key Dockerfile Best Practices Enforced:
1. **Layer Caching:** `package*.json` is copied and installed *before* copying source code. Code edits do not trigger expensive `npm install` re-runs.
2. **Non-Root Execution:** Backend executes under unprivileged `USER node` context (preventing root container breakouts).
3. **Container Healthchecks:** Native `HEALTHCHECK` instructions baked into containers for self-healing monitoring.
4. **`.dockerignore` Optimization:** Excludes `node_modules`, `.git`, `.env`, and test logs from build contexts.

---

## 3. 🎼 Docker Compose Multi-Container Orchestration

The [docker-compose.yml](file:///d:/mini%20project/docker-compose.yml) orchestrates the 3-tier microservice architecture:

```yaml
version: '3.8'

services:
  db:
    image: mysql:8.4
    container_name: campusconnect-mysql
    restart: unless-stopped
    volumes:
      - mysql_data:/var/lib/mysql
      - ./backend/config/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    networks:
      - campusconnect-net
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "127.0.0.1", "-u", "root", "-proot"]

  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    container_name: campusconnect-backend
    volumes:
      - uploads_data:/app/backend/uploads
    networks:
      - campusconnect-net
    depends_on:
      db:
        condition: service_healthy

  frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile
    container_name: campusconnect-frontend
    ports:
      - "80:80"
    networks:
      - campusconnect-net
    depends_on:
      backend:
        condition: service_healthy

volumes:
  mysql_data:
    name: campusconnect_mysql_data
  uploads_data:
    name: campusconnect_uploads_data

networks:
  campusconnect-net:
    name: campusconnect_network
    driver: bridge
```

---

## 4. 🛠️ Operational Automation Scripts (`scripts/`)

| Command | Action |
|---|---|
| `bash scripts/docker_build.sh` | Compiles both multi-stage images and prints image size metrics. |
| `bash scripts/docker_up.sh` | Starts all 3 containers with automated health-check polling until green. |
| `bash scripts/docker_down.sh` | Gracefully shuts down containers while preserving persistent volumes. |
| `bash scripts/docker_clean.sh` | Prunes dangling images, stopped containers, and builder cache. |

---

## 5. 🎓 Viva & Technical Defense Questions (Docker)

1. **Q: Multi-stage build kya hota hai aur iska primary fayda kya hai?**
   - **A:** Multi-stage build ek Docker feature hai jisme ek hi `Dockerfile` ke andar multiple `FROM` stages use hoti hain. Stage 1 (builder) me code compile/build hota hai, aur Stage 2 (runner) me sirf compiled artifacts copy kiye jate hain. Isse build tools aur devDependencies eliminate ho jati hain, jisse **image size 1GB se ghatkar 25MB ho jata hai** aur attack surface minimize hota hai.

2. **Q: Docker Volume aur Bind Mount me kya difference hai?**
   - **A:**
     - **Named Volume:** Docker dwara `/var/lib/docker/volumes` par manage hota hai, OS-independent hota hai, aur production database persistence ke liye best practice hai.
     - **Bind Mount:** Host machine ke kisi specific directory path (jaise `./backend`) ko container ke andar mount karta hai. Yeh local development me live code reloading (hot reload) ke liye ideal hota hai.

3. **Q: Docker Network me containers ek doosre se kaise communicate karte hain?**
   - **A:** Custom user-defined bridge network me Docker ke paas built-in internal DNS server hota hai. Containers IP address ki jagah unke **service name** (jaise `db:3306` ya `backend:5000`) se communicate karte hain.

4. **Q: `CMD` aur `ENTRYPOINT` me kya farq hai?**
   - **A:** `ENTRYPOINT` container ka primary executable define karta hai jo command-line arguments se overwrite nahi hota, jabki `CMD` default arguments provide karta hai jo `docker run` command ke waqt easily overwrite ho sakte hain.

5. **Q: `COPY` vs `ADD` me best practice kya hai?**
   - **A:** Best practice `COPY` use karna hai kyunki yeh predictable aur safe hai. `ADD` local tar archives ko auto-extract karta hai aur remote URLs support karta hai, jo unexpected security vulnerabilities la sakta hai.

6. **Q: Production container ko `root` user se kyu nahi run karna chahiye?**
   - **A:** Agar attacker application me kisi vulnerability (jaise remote code execution) ke through container compromise karta hai, to non-root user hone par wo container breakout karke host system ka root access nahi le sakta. Isiliye hum `USER node` enforce karte hain.
