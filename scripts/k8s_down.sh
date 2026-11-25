#!/usr/bin/env bash
# ==============================================================================
# scripts/k8s_down.sh — Remove CampusConnect Kubernetes Namespace cleanly
# ==============================================================================

set -e

echo "Deleting CampusConnect Kubernetes Namespace (all Pods, Services, PVCs)..."
kubectl delete namespace campusconnect --ignore-not-found
echo "Cleanup complete!"
