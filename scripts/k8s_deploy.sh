#!/usr/bin/env bash
# ==============================================================================
# scripts/k8s_deploy.sh — Deploy CampusConnect Stack to Kubernetes (Minikube)
# Loads multi-stage Docker images, seeds MySQL schema, and applies k8s/*.yaml
# ==============================================================================

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}   CampusConnect Kubernetes (K8s) Deployment          ${NC}"
echo -e "${BLUE}======================================================${NC}"

# 1. Verify cluster is running
echo -e "\n${YELLOW}[1/5] Checking Kubernetes cluster status...${NC}"
kubectl cluster-info

# 2. Build/tag if needed and load Docker images into Minikube container runtime
echo -e "\n${YELLOW}[2/5] Loading Docker images into Minikube...${NC}"
if ! docker image inspect miniproject-backend:latest >/dev/null 2>&1; then
  docker build -t miniproject-backend:latest -f backend/Dockerfile .
fi
if ! docker image inspect miniproject-frontend:latest >/dev/null 2>&1; then
  docker build -t miniproject-frontend:latest -f frontend/Dockerfile .
fi
minikube image load miniproject-backend:latest
minikube image load miniproject-frontend:latest
minikube image load mysql:8.4

# 3. Create Namespace and Seed MySQL Init Schema ConfigMap (Single Source of Truth)
echo -e "\n${YELLOW}[3/5] Applying Namespace & MySQL Schema ConfigMap...${NC}"
kubectl apply -f k8s/00-namespace.yaml
kubectl create configmap mysql-init-sql \
  --from-file=init.sql=backend/config/init.sql \
  -n campusconnect \
  --dry-run=client -o yaml | kubectl apply -f -

# 4. Apply ConfigMaps, Secrets, Deployments, Services, and HPA
echo -e "\n${YELLOW}[4/5] Applying Kubernetes Deployments, Services & HPA...${NC}"
kubectl apply -f k8s/

# 5. Wait for all pods to become Ready
echo -e "\n${YELLOW}[5/5] Waiting for Pods to reach Ready state...${NC}"
kubectl rollout status deployment/mysql -n campusconnect --timeout=180s
kubectl rollout status deployment/campusconnect-backend -n campusconnect --timeout=120s
kubectl rollout status deployment/campusconnect-frontend -n campusconnect --timeout=120s

echo -e "\n${GREEN}======================================================${NC}"
echo -e "${GREEN}   ✓ CampusConnect Successfully Deployed on K8s!      ${NC}"
echo -e "${GREEN}======================================================${NC}"
kubectl get all,hpa,pvc -n campusconnect

echo -e "\n${BLUE}Access Frontend via NodePort URL:${NC}"
minikube service frontend-nodeport -n campusconnect --url || true
