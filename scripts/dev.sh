#!/usr/bin/env bash
# ==============================================================================
# scripts/dev.sh — Local & Linux Development Environment Starter
# Gracefully manages Backend (Node 5000), Frontend (Vite 5173), and Database
# Traps SIGINT / SIGTERM to clean up all spawned child processes
# ==============================================================================

set -euo pipefail

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo -e "${CYAN}====================================================${NC}"
echo -e "${CYAN}🚀 CampusConnect Local Dev Environment Starter${NC}"
echo -e "${CYAN}====================================================${NC}"

# Check for .env file
if [ ! -f .env ]; then
  echo -e "${YELLOW}⚠️ .env not found! Creating from .env.example...${NC}"
  if [ -f .env.example ]; then
    cp .env.example .env
  fi
fi

# Check Node modules
if [ ! -d "node_modules" ]; then
  echo -e "${YELLOW}📦 Installing root/backend dependencies...${NC}"
  npm install
fi

if [ ! -d "frontend/node_modules" ]; then
  echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
  (cd frontend && npm install)
fi

# Trap signals for graceful shutdown
cleanup() {
  echo -e "\n${YELLOW}🛑 Shutting down CampusConnect services gracefully...${NC}"
  kill 0 2>/dev/null || true
  wait 2>/dev/null || true
  echo -e "${GREEN}✅ All services stopped.${NC}"
  exit 0
}

trap cleanup SIGINT SIGTERM EXIT

echo -e "${GREEN}Starting Backend Server on port ${PORT:-5001}...${NC}"
(node backend/server.js) &
BACKEND_PID=$!

sleep 1

echo -e "${GREEN}Starting Frontend Vite Dev Server on port 5173...${NC}"
(npm run dev --prefix frontend) &
FRONTEND_PID=$!

echo -e "${CYAN}====================================================${NC}"
echo -e "${GREEN}✅ Backend API: http://localhost:${PORT:-5001}${NC}"
echo -e "${GREEN}✅ Frontend UI: http://localhost:5173${NC}"
echo -e "${YELLOW}Press [CTRL+C] at any time to stop all services.${NC}"
echo -e "${CYAN}====================================================${NC}"

wait
