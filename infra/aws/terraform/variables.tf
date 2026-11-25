# ==============================================================================
# infra/aws/terraform/variables.tf
# ==============================================================================

variable "aws_region" {
  type        = string
  default     = "us-east-1"
  description = "AWS deployment region"
}

variable "vpc_id" {
  type        = string
  default     = "vpc-0f091da9eaaf297cd"
  description = "VPC ID where resources are deployed"
}

variable "subnet_id" {
  type        = string
  default     = "subnet-0eb2f65dd0d6342d7"
  description = "Public subnet ID for EC2 instance"
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
}

variable "key_name" {
  type        = string
  default     = "campusconnect-key"
  description = "EC2 SSH Key Pair name"
}

variable "s3_bucket_name" {
  type        = string
  default     = "campusconnect-storage-343980058788"
  description = "Global unique S3 bucket name"
}
