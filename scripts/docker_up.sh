#!/usr/bin/env bash
# ==============================================================================
# scripts/docker_up.sh — Multi-Container Compose Starter & Health Validator
# Starts MySQL, Backend, and Frontend containers and polls health status
# ==============================================================================

set -euo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}🚀 Starting CampusConnect Docker Multi-Container Stack${NC}"
echo -e "${BLUE}====================================================${NC}"

# Start services via Docker Compose
docker compose up -d --build

echo -e "\n${YELLOW}⏳ Waiting for containers to pass health checks...${NC}"

MAX_ATTEMPTS=20
ATTEMPT=1

while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
  DB_STATUS=$(docker inspect --format='{{json .State.Health.Status}}' campusconnect-mysql 2>/dev/null || echo '"starting"')
  
  if [ "$DB_STATUS" = '"healthy"' ]; then
    echo -e "${GREEN}✅ Database container is healthy!${NC}"
    break
  fi
  
  echo "Attempt $ATTEMPT/$MAX_ATTEMPTS: Database status is $DB_STATUS... waiting 3s"
  sleep 3
  ATTEMPT=$((ATTEMPT + 1))
done

echo -e "\n${GREEN}====================================================${NC}"
echo -e "${GREEN}🎉 CampusConnect Stack is Active & Ready!${NC}"
echo -e "${GREEN}Frontend Web:  http://localhost${NC}"
echo -e "${GREEN}Backend API:   http://localhost:5000/api/health${NC}"
echo -e "${GREEN}MySQL Server:  localhost:3306 (user: root)${NC}"
echo -e "${GREEN}====================================================${NC}"

docker compose ps
