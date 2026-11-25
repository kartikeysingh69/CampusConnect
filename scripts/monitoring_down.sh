#!/usr/bin/env bash
# ==============================================================================
# scripts/monitoring_down.sh — Stop Observability Stack cleanly
# ==============================================================================

set -e
docker compose -f docker-compose.monitoring.yml down
echo "Monitoring stack stopped."
