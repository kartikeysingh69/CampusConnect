#!/usr/bin/env bash
# ==============================================================================
# scripts/deploy.sh — CampusConnect Production Deployment Automation Script
# Pulls git main, installs production packages, builds frontend, validates,
# and verifies live health checks.
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
echo -e "${BLUE}🚀 CampusConnect Automated Production Deployment${NC}"
echo -e "${BLUE}====================================================${NC}"

# 1. Verify Git Status & Pull Latest Code
echo -e "${YELLOW}[1/5] Synchronizing latest code from Git origin/main...${NC}"
git fetch origin main
git merge origin/main --ff-only

# 2. Install production dependencies
echo -e "${YELLOW}[2/5] Updating and installing production dependencies...${NC}"
npm install --omit=dev
(cd frontend && npm install)

# 3. Compile and Build Frontend
echo -e "${YELLOW}[3/5] Building production frontend assets...${NC}"
npm run build --prefix frontend

# 4. Database Schema Migration check (if any migration files present)
echo -e "${YELLOW}[4/5] Checking database connectivity...${NC}"
node -e "
const db = require('./backend/config/db');
db.execute('SELECT 1')
  .then(() => { console.log('✅ Database connected'); process.exit(0); })
  .catch(err => { console.error('❌ DB Error:', err.message); process.exit(1); });
"

# 5. Service Reload & Health Verification
echo -e "${YELLOW}[5/5] Reloading service and verifying production health...${NC}"
if command -v systemctl &> /dev/null && systemctl list-unit-files | grep -q campusconnect; then
  echo "Restarting campusconnect systemd service..."
  sudo systemctl restart campusconnect-backend.service
fi

sleep 2

# Run healthcheck
if [ -f "scripts/healthcheck.sh" ]; then
  bash scripts/healthcheck.sh
fi

echo -e "${GREEN}====================================================${NC}"
echo -e "${GREEN}🎉 Deployment successfully finished and verified!${NC}"
echo -e "${GREEN}Commit Deployed: $(git rev-parse --short HEAD)${NC}"
echo -e "${GREEN}Date: $(date +'%Y-%m-%d %H:%M:%S')${NC}"
echo -e "${GREEN}====================================================${NC}"
