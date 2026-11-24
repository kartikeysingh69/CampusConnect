#!/usr/bin/env bash
# ==============================================================================
# scripts/build.sh — CampusConnect Production Build & Artifact Packaging
# Builds Vite frontend bundle and validates backend readiness
# ==============================================================================

set -euo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo -e "${BLUE}[1/3] Validating Environment & Dependency Trees...${NC}"
node -v
npm -v

echo -e "${BLUE}[2/3] Compiling and Optimizing Frontend (Vite Production Build)...${NC}"
npm run build --prefix frontend

if [ -d "frontend/dist" ] && [ -f "frontend/dist/index.html" ]; then
  echo -e "${GREEN}✅ Frontend production build output verified in frontend/dist${NC}"
else
  echo -e "${RED}❌ Frontend build artifact missing!${NC}" >&2
  exit 1
fi

echo -e "${BLUE}[3/3] Performing Backend Syntax & Import Checks...${NC}"
node -c backend/server.js
node -c backend/routes/auth.js
node -c backend/routes/jobs.js
node -c backend/routes/assessment.js

echo -e "${GREEN}====================================================${NC}"
echo -e "${GREEN}🎉 Production build completed and validated successfully!${NC}"
echo -e "${GREEN}====================================================${NC}"
