#!/usr/bin/env bash
# ==============================================================================
# scripts/ci_test.sh — Local Continuous Integration (CI) Test Runner
# Replicates the GitHub Actions CI pipeline locally on your development machine.
# ==============================================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}   CampusConnect Local CI Pipeline Verification       ${NC}"
echo -e "${BLUE}======================================================${NC}"

# Step 1: Environment check
echo -e "\n${YELLOW}[1/3] Checking Node.js and NPM environments...${NC}"
node -v
npm -v

# Step 2: Backend Unit Tests
echo -e "\n${YELLOW}[2/3] Executing Backend Unit Tests (node:test)...${NC}"
npm test
echo -e "${GREEN}✓ Backend Unit Tests Passed!${NC}"

# Step 3: Frontend Build Verification
echo -e "\n${YELLOW}[3/3] Executing Frontend Production Build Verification...${NC}"
npm test --prefix frontend
echo -e "${GREEN}✓ Frontend Build & Bundle Verification Passed!${NC}"

echo -e "\n${GREEN}======================================================${NC}"
echo -e "${GREEN}  ✓ ALL LOCAL CI CHECKS PASSED SUCCESSFULLY!          ${NC}"
echo -e "${GREEN}  Your code is ready for GitHub Actions CI/CD push!   ${NC}"
echo -e "${GREEN}======================================================${NC}"
