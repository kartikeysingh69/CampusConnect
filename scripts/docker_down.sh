#!/usr/bin/env bash
# ==============================================================================
# scripts/docker_down.sh — Graceful Container Teardown
# Stops containers without deleting persistent database/upload volumes
# ==============================================================================

set -euo pipefail

YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo -e "${YELLOW}🛑 Stopping CampusConnect Docker containers gracefully...${NC}"
docker compose down

echo -e "${GREEN}✅ Containers stopped. Named volumes (mysql_data, uploads_data) preserved.${NC}"
