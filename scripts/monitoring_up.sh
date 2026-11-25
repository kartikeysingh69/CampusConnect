#!/usr/bin/env bash
# ==============================================================================
# scripts/monitoring_up.sh — Start Prometheus, Grafana, Alertmanager & Node Exporter
# ==============================================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Starting CampusConnect Observability Stack...${NC}"
docker compose -f docker-compose.yml up -d backend
docker compose -f docker-compose.monitoring.yml up -d

echo -e "\n${GREEN}✓ Monitoring Stack Live:${NC}"
echo -e "  • Grafana Dashboard : http://localhost:3000  (admin / admin)"
echo -e "  • Prometheus UI     : http://localhost:9090"
echo -e "  • Alertmanager UI   : http://localhost:9093"
echo -e "  • Backend Metrics   : http://localhost:5001/metrics"
echo -e "  • Host Node Exporter: http://localhost:9100/metrics"
