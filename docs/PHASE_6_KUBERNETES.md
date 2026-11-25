# Phase 6: Container Orchestration with Kubernetes (K8s)

> **Advanced DevOps Mastery**: High Availability Deployments, Service Discovery (`ClusterIP`, `NodePort`, `LoadBalancer`), Self-Healing Probes (`livenessProbe` / `readinessProbe`), Persistent Storage (`PVC`), and Horizontal Pod Autoscaling (`HPA`) running live on **Minikube**.

---

## 1. Why Kubernetes After Docker Compose?

Examiner's favorite transition question: *"Docker Compose toh already tha, Kubernetes kyun lagaya?"*

| Capability | Docker Compose (Single Host) | Kubernetes (Production Orchestrator) |
| :--- | :--- | :--- |
| **Scale** | Runs on a single server only | Orchestrates across **multi-node clusters** |
| **Self-Healing** | Basic `restart: unless-stopped` on same box | **Active health probes** (`liveness`/`readiness`) + automatic **rescheduling** across healthy nodes if a node dies |
| **Zero-Downtime Updates** | Brief downtime during container recreate | Built-in **RollingUpdate** (`maxUnavailable: 0`) spins up new Pods before terminating old ones |
| **Auto-Scaling** | Manual `--scale` command only | Native **Horizontal Pod Autoscaler (HPA)** automatically scales Pods based on real-time CPU/RAM load |
| **Secrets & Configs** | Plain `.env` files | Encrypted cluster **Secrets** & dynamic **ConfigMaps** |

---

## 2. CampusConnect Kubernetes Architecture Diagram

```mermaid
flowchart TD
    User(["🌐 Browser / External Users"]) -->|HTTP :30080 (NodePort)| NodePort["🔌 Service: frontend-nodeport<br/>(type: NodePort)"]
    User -->|Cloud LB :80| LB["⚖️ Service: frontend-loadbalancer<br/>(type: LoadBalancer)"]

    subgraph K8s_Cluster["☸️ Kubernetes Cluster (Namespace: campusconnect)"]
        
        subgraph Frontend_Tier["🎨 Frontend Deployment (Min 2 -> Max 4 Pods)"]
            NodePort --> FE_Pod1["📦 Nginx Pod 1<br/>liveness + readiness /health"]
            NodePort --> FE_Pod2["📦 Nginx Pod 2<br/>liveness + readiness /health"]
            LB --> FE_Pod1
            LB --> FE_Pod2
            HPA_FE["📈 HPA: frontend-hpa<br/>Scale if CPU > 70%"] -.-> FE_Pod1
        end

        FE_Pod1 -->|http://backend:5000 (CoreDNS)| BE_Svc["🔒 Service: backend<br/>(type: ClusterIP :5000)"]
        FE_Pod2 -->|http://backend:5000| BE_Svc

        subgraph Backend_Tier["⚙️ Backend Deployment (Min 2 -> Max 5 Pods)"]
            BE_Svc --> BE_Pod1["📦 Express API Pod 1<br/>liveness + readiness /api/health"]
            BE_Svc --> BE_Pod2["📦 Express API Pod 2<br/>liveness + readiness /api/health"]
            HPA_BE["📈 HPA: backend-hpa<br/>Scale if CPU > 60%"] -.-> BE_Pod1
        end

        Config["📋 ConfigMap + 🔐 Secret<br/>DB credentials & JWT key"] -.->|Inject Env| BE_Pod1
        Config -.->|Inject Env| BE_Pod2

        BE_Pod1 -->|mysql:3306 (CoreDNS)| DB_Svc["🔒 Service: mysql<br/>(type: ClusterIP :3306)"]
        BE_Pod2 -->|mysql:3306| DB_Svc

        subgraph Database_Tier["🗄️ Stateful Database Tier"]
            DB_Svc --> MySQL_Pod["📦 MySQL 8.4 Pod<br/>mysqladmin ping probes"]
            MySQL_Pod -->|Mounts /var/lib/mysql| PVC[("💾 PersistentVolumeClaim<br/>mysql-pvc (2Gi ReadWriteOnce)")]
        end
    end
```

---

## 3. Kubernetes Manifests Catalog (`k8s/`)

| Manifest | Kubernetes Kind(s) | Purpose & Viva Highlight |
| :--- | :--- | :--- |
| [00-namespace.yaml](../k8s/00-namespace.yaml) | `Namespace` | Isolates `campusconnect` workloads cleanly from system pods |
| [01-config-and-secrets.yaml](../k8s/01-config-and-secrets.yaml) | `ConfigMap`, `Secret` | Decouples environment config (`DB_HOST`) and secrets (`JWT_SECRET`) from container images |
| [02-mysql-deployment.yaml](../k8s/02-mysql-deployment.yaml) | `PersistentVolumeClaim`, `Deployment`, `Service (ClusterIP)` | Persists MySQL data across Pod restarts; `ClusterIP` prevents external DB exposure |
| [03-backend-deployment.yaml](../k8s/03-backend-deployment.yaml) | `Deployment (2 replicas)`, `Service (ClusterIP)` | Zero-downtime RollingUpdate, `/api/health` probes, CoreDNS name `backend` matching Nginx proxy |
| [04-frontend-deployment.yaml](../k8s/04-frontend-deployment.yaml) | `Deployment (2 replicas)`, `Service (NodePort)`, `Service (LoadBalancer)` | High-availability Nginx UI exposed on static NodePort `30080` and LoadBalancer port `80` |
| [05-hpa.yaml](../k8s/05-hpa.yaml) | `HorizontalPodAutoscaler` (`autoscaling/v2`) | Auto-scales Backend (2→5 pods @ 60% CPU) and Frontend (2→4 pods @ 70% CPU) via `metrics-server` |

---

## 4. Deep Dive: Kubernetes Core Concepts

### A. Pods vs Deployments vs ReplicaSets
- **Pod**: The smallest deployable unit in Kubernetes — a wrapper around one (or tightly coupled) container(s) sharing network IP and storage. Pods are **ephemeral** (never create raw Pods directly in production!).
- **ReplicaSet**: Ensures a specified number of identical Pod replicas (`2`) are always running.
- **Deployment**: Declarative controller managing ReplicaSets, supporting **Rolling Updates** (`maxUnavailable: 0`) and instant **Rollbacks** (`kubectl rollout undo`).

### B. Three Kubernetes Service Types (All Used Here!)
| Service Type | Scope | Used In CampusConnect |
| :--- | :--- | :--- |
| **`ClusterIP`** *(Default)* | Internal cluster communication ONLY via CoreDNS | `mysql:3306` and `backend:5000` (Zero external exposure) |
| **`NodePort`** | Opens a static port (`30000-32767`) on every cluster node IP | `frontend-nodeport` on port **`30080`** for direct Minikube browser access |
| **`LoadBalancer`** | Provisions a Cloud Provider Network/Application Load Balancer | `frontend-loadbalancer` on port **`80`** (works with `minikube tunnel` or AWS EKS) |

### C. Self-Healing: Liveness vs Readiness Probes
- **`readinessProbe`**: Checks *"Is the container ready to receive user traffic?"* If MySQL is still booting or API `/api/health` fails, Kubernetes removes the Pod's IP from Service endpoints until ready — preventing `502 Bad Gateway` errors!
- **`livenessProbe`**: Checks *"Is the container alive or deadlocked?"* If `/api/health` fails 3 consecutive times, **Kubelet automatically kills and restarts the container**.

### D. Horizontal Pod Autoscaler (HPA)
- Queries **`metrics-server`** every 15 seconds for live Pod CPU usage compared to `resources.requests.cpu`.
- If traffic spikes during a campus placement drive and backend CPU exceeds `60%`, `backend-hpa` automatically spins up additional Pods (up to `5`) and scales back down to `2` once traffic drops!

---

## 5. Live Examiner Demo Script (Minikube Terminal Commands)

Run these commands live in front of the examiner to prove real K8s mastery:

```bash
# 1. Inspect ALL running Kubernetes objects in campusconnect namespace
kubectl get all,hpa,pvc -n campusconnect

# 2. Prove Pod Distribution & Zero-Trust ClusterIP vs NodePort vs LoadBalancer
kubectl get svc -n campusconnect

# 3. Live Self-Healing Demo (Crash a Pod and watch instant recovery!)
./scripts/k8s_test_selfheal.sh

# 4. Show real-time CPU & Memory metrics powering HPA
kubectl top pods -n campusconnect

# 5. Open live CampusConnect portal hosted inside Kubernetes
minikube service frontend-nodeport -n campusconnect
```

---

## 6. Top 8 Kubernetes Viva Questions & Answers

### Q1: What is the difference between a Docker Container and a Kubernetes Pod?
> **Answer**:
> A **Docker Container** is an isolated runtime process packaging an application. A **Kubernetes Pod** is a higher-level logical host encapsulating one or more containers that share the same Linux network namespace (same IP & `localhost`), storage volumes, and lifecycle specification.

---

### Q2: Explain `ClusterIP`, `NodePort`, and `LoadBalancer` Services.
> **Answer**:
> - **`ClusterIP`**: Assigns an internal-only virtual IP reachable strictly from inside the cluster. Used for MySQL (`mysql:3306`) and Backend API (`backend:5000`).
> - **`NodePort`**: Exposes the service on a fixed high port (`30000–32767`, ours is `30080`) on every worker node's IP address.
> - **`LoadBalancer`**: Integrates with a cloud provider (AWS ELB / GCP LB) to provision an external public IP routing traffic cleanly across backend NodePorts.

---

### Q3: How does Kubernetes achieve Self-Healing?
> **Answer**:
> Through two layers:
> 1. **Pod-level (ReplicaSet Controller)**: Continuously runs a reconciliation loop checking `Desired State (2 replicas) == Current State`. If a Pod crashes or is deleted, ReplicaSet immediately schedules a new Pod.
> 2. **Container-level (Kubelet Probes)**: `livenessProbe` restarts frozen containers, while `readinessProbe` pauses traffic routing until dependencies (like MySQL) are healthy.

---

### Q4: How does Horizontal Pod Autoscaler (HPA) calculate when to scale?
> **Answer**:
> HPA uses the formula:
> `desiredReplicas = ceil[currentReplicas * (currentMetricValue / desiredMetricValue)]`
> To work, every container **must define `resources.requests.cpu`**, and the cluster must run **`metrics-server`**. In CampusConnect, `backend-hpa` targets `60%` average CPU utilization and scales dynamically between `2` and `5` Pods.

---

### Q5: Why do we use a `PersistentVolumeClaim (PVC)` for MySQL instead of regular container storage?
> **Answer**:
> Containers are stateless — if the MySQL Pod restarts or moves to another node, all data inside the container filesystem would be permanently lost. Mounting a **PVC (`mysql-pvc`)** binds persistent disk storage independently of the Pod's lifecycle so placement and student records survive crashes.

---

### Q6: What is the difference between a `ConfigMap` and a `Secret`?
> **Answer**:
> - **`ConfigMap`**: Stores non-confidential key-value configuration (like `PORT=5000`, `DB_HOST=mysql`, or `init.sql` scripts).
> - **`Secret`**: Stores sensitive credentials (`DB_PASSWORD`, `JWT_SECRET`), base64-encoded by the API and mountable securely as environment variables or in-memory tmpfs files, with RBAC access restrictions.

---

### Q7: Why did we name our backend Service `backend` in Kubernetes?
> **Answer**:
> Our Nginx reverse proxy (`frontend/nginx.conf`) forwards `/api/` calls to `http://backend:5000`. Because Kubernetes **CoreDNS** automatically creates DNS records matching Service names (`<service>.<namespace>.svc.cluster.local`, shortened to `<service>` within the same namespace), naming the Service `backend` lets the **exact same Docker image** work identically in both Docker Compose and Kubernetes!

---

### Q8: How do Zero-Downtime Rolling Updates work?
> **Answer**:
> By setting `strategy.type: RollingUpdate` with `maxUnavailable: 0` and `maxSurge: 1`. When deploying a new image version, Kubernetes starts 1 new Pod first, waits for its `readinessProbe` (`/api/health`) to return `200 OK`, shifts traffic over, and only then terminates an old Pod — repeating until all Pods are updated with zero dropped requests.
