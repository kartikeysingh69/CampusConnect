#!/usr/bin/env bash
# ==============================================================================
# scripts/terraform_manage.sh — Terraform IaC Lifecycle Helper
# Usage: ./scripts/terraform_manage.sh [init|plan|apply|status|output|destroy]
# ==============================================================================

set -e

TF_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../infra/aws/terraform" && pwd)"
ACTION="${1:-status}"

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

cd "$TF_DIR"

case "$ACTION" in
  init)
    echo -e "${BLUE}[Terraform] Initializing providers & formatting HCL...${NC}"
    terraform fmt -check || terraform fmt
    terraform init
    terraform validate
    ;;
  plan)
    echo -e "${BLUE}[Terraform] Generating execution plan (Dry Run)...${NC}"
    terraform plan
    ;;
  apply)
    echo -e "${YELLOW}[Terraform] Applying infrastructure changes...${NC}"
    terraform apply
    ;;
  status)
    echo -e "${BLUE}[Terraform] Managed State Resources (terraform.tfstate):${NC}"
    terraform state list
    echo -e "\n${GREEN}[Terraform] Live Outputs:${NC}"
    terraform output
    ;;
  output)
    terraform output
    ;;
  destroy)
    echo -e "${YELLOW}[Terraform] Destroying all Terraform-managed cloud resources...${NC}"
    terraform destroy
    ;;
  *)
    echo "Usage: $0 {init|plan|apply|status|output|destroy}"
    exit 1
    ;;
esac
