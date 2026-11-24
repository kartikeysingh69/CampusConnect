#!/usr/bin/env bash
# ==============================================================================
# scripts/docker_build.sh — Multi-Stage Docker Image Builder
# Compiles backend and frontend multi-stage containers and outputs image stats
# ==============================================================================

set -euo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}🐳 CampusConnect Multi-Stage Docker Image Builder${NC}"
echo -e "${BLUE}====================================================${NC}"

# Check Docker installation
if ! command -v docker &> /dev/null; then
  echo "❌ Error: docker is not installed or not in PATH." >&2
  exit 1
fi

echo -e "${YELLOW}[1/2] Building Backend Multi-Stage Container (node:22-alpine)...${NC}"
docker build -t campusconnect-backend:latest -f backend/Dockerfile .

echo -e "${YELLOW}[2/2] Building Frontend Multi-Stage Container (nginx:alpine)...${NC}"
docker build -t campusconnect-frontend:latest -f frontend/Dockerfile .

echo -e "\n${GREEN}====================================================${NC}"
echo -e "${GREEN}🎉 Docker Images Built Successfully!${NC}"
echo -e "${GREEN}Image Size Comparison:${NC}"
docker images | grep campusconnect || true
echo -e "${GREEN}====================================================${NC}"
