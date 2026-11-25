# ==============================================================================
# infra/aws/terraform/locals.tf — Centralized Computed Expressions & Common Tags
# ==============================================================================

locals {
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Repository  = "github.com/kartikeysingh69/CampusConnect"
  }
}
