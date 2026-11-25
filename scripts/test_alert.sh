#!/usr/bin/env bash
# ==============================================================================
# scripts/test_alert.sh — Simulate Server Down & Watch Alert Fire LIVE!
# ==============================================================================

set -e

YELLOW='\033[1;33m'
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${RED}[1/3] Stopping campusconnect-backend container to simulate outage...${NC}"
docker stop campusconnect-backend

echo -e "${YELLOW}[2/3] Waiting 25s for Prometheus scrape + CampusConnectBackendDown rule (15s)...${NC}"
sleep 25

echo -e "${YELLOW}Active Firing Alerts from Prometheus:${NC}"
curl -s http://localhost:9090/api/v1/alerts

echo -e "\n\n${GREEN}[3/3] Recovering campusconnect-backend container...${NC}"
docker start campusconnect-backend
echo -e "${GREEN}✓ Backend restored! Alert will resolve automatically.${NC}"
