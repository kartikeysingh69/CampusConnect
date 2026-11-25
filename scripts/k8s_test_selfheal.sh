#!/usr/bin/env bash
# ==============================================================================
# scripts/k8s_test_selfheal.sh — Live Examiner Demo of Kubernetes Self-Healing
# Crashes/deletes one live backend Pod and proves ReplicaSet auto-recovers it!
# ==============================================================================

set -e

YELLOW='\033[1;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}=== Current Backend Pods (Before Crash Simulation) ===${NC}"
kubectl get pods -l app=campusconnect-backend -n campusconnect

TARGET_POD=$(kubectl get pods -l app=campusconnect-backend -n campusconnect -o jsonpath="{.items[0].metadata.name}")

echo -e "\n${RED}[DEMO] Simulating container crash by deleting Pod: $TARGET_POD${NC}"
kubectl delete pod "$TARGET_POD" -n campusconnect

echo -e "\n${YELLOW}[DEMO] Kubernetes ReplicaSet immediately creates a replacement Pod:${NC}"
kubectl get pods -l app=campusconnect-backend -n campusconnect

echo -e "\n${YELLOW}Waiting for deployment to stabilize at 2/2 Running...${NC}"
kubectl rollout status deployment/campusconnect-backend -n campusconnect --timeout=90s

echo -e "\n${GREEN}✓ Self-Healing Verified! 2/2 Backend Pods Running:${NC}"
kubectl get pods -l app=campusconnect-backend -n campusconnect
