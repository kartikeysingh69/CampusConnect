# ==============================================================================
# infra/aws/terraform/variables.tf — Parameterized Inputs with Validation Rules
# ==============================================================================

variable "aws_region" {
  type        = string
  default     = "us-east-1"
  description = "AWS deployment region"

  validation {
    condition     = can(regex("^[a-z]{2}-[a-z]+-[0-9]+$", var.aws_region))
    error_message = "The aws_region must be a valid AWS region identifier (e.g., us-east-1, ap-south-1)."
  }
}

variable "project_name" {
  type        = string
  default     = "CampusConnect"
  description = "Project identifier used in resource naming and tagging"
}

variable "environment" {
  type        = string
  default     = "production"
  description = "Deployment environment (dev, staging, production)"

  validation {
    condition     = contains(["dev", "staging", "production"], var.environment)
    error_message = "Environment must be one of: dev, staging, production."
  }
}

variable "vpc_id" {
  type        = string
  default     = "vpc-0f091da9eaaf297cd"
  description = "Target AWS VPC ID (leave default for us-east-1 default VPC)"
}

variable "subnet_id" {
  type        = string
  default     = "subnet-0eb2f65dd0d6342d7"
  description = "Public subnet ID for EC2 instance placement"
}

variable "ami_id" {
  type        = string
  default     = "ami-0aacbf72109c53c0c"
  description = "Amazon Linux 2023 AMI ID"
}

variable "instance_type" {
  type        = string
  default     = "t3.micro"
  description = "Free Tier EC2 instance type"

  validation {
    condition     = contains(["t3.micro", "t2.micro", "t4g.micro"], var.instance_type)
    error_message = "Only Free Tier eligible micro instances (t3.micro, t2.micro, t4g.micro) are allowed to prevent unexpected billing."
  }
}

variable "key_name" {
  type        = string
  default     = "campusconnect-key"
  description = "EC2 SSH Key Pair name"
}

variable "s3_bucket_name" {
  type        = string
  default     = "campusconnect-storage-343980058788"
  description = "Globally unique S3 bucket name for resumes & backups"

  validation {
    condition     = can(regex("^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$", var.s3_bucket_name))
    error_message = "S3 bucket name must be lowercase alphanumeric or hyphens (3-63 chars)."
  }
}
