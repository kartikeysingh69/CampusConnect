#!/usr/bin/env bash
# ==============================================================================
# scripts/docker_clean.sh — Docker Hygiene & Disk Reclaim Utility
# Safely removes dangling images, stopped containers, and builder cache
# ==============================================================================

set -euo pipefail

YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${YELLOW}🧹 Cleaning dangling Docker images and builder cache...${NC}"

# Prune stopped containers
docker container prune -f

# Prune dangling images
docker image prune -f

# Prune builder cache
docker builder prune -f

echo -e "${GREEN}✅ Docker cleanup completed. Disk space reclaimed!${NC}"
