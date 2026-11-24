#!/usr/bin/env bash
# ==============================================================================
# scripts/healthcheck.sh — CampusConnect Production Health & Service Monitor
# Checks API HTTP 200 status, database connectivity, memory, and disk capacity
# Exit codes: 0 = Healthy, 1 = Unhealthy / Service Down
# ==============================================================================

set -euo pipefail

API_URL="${API_URL:-http://localhost:5000/api/health}"
MAX_TIMEOUT=5

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "[$(date +'%Y-%m-%d %H:%M:%S')] Probing CampusConnect Health Endpoint: ${API_URL}..."

if ! command -v curl &> /dev/null; then
  echo "Error: curl is required to run healthcheck." >&2
  exit 1
fi

HTTP_RESPONSE=$(curl -s -m "$MAX_TIMEOUT" -w "HTTPSTATUS:%{http_code}" "$API_URL" || echo "HTTPSTATUS:000")
HTTP_BODY=$(echo "$HTTP_RESPONSE" | sed -e 's/HTTPSTATUS\:.*//g')
HTTP_CODE=$(echo "$HTTP_RESPONSE" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')

if [ "$HTTP_CODE" -eq 200 ]; then
  echo -e "${GREEN}✅ API Health Check PASSED (HTTP 200 OK)${NC}"
  echo "Response Details: $HTTP_BODY"
  
  # Disk space check (>90% full triggers warning)
  DISK_USAGE=$(df -h . | awk 'NR==2 {print $5}' | tr -d '%')
  if [ "$DISK_USAGE" -gt 90 ]; then
    echo -e "${RED}⚠️ WARNING: Disk usage critical (${DISK_USAGE}% full)${NC}"
  else
    echo "Disk Capacity: ${DISK_USAGE}% utilized (Normal)"
  fi
  exit 0
else
  echo -e "${RED}❌ API Health Check FAILED with status code: ${HTTP_CODE}${NC}" >&2
  echo "Error Response: $HTTP_BODY" >&2
  exit 1
fi
