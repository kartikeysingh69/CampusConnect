# ==============================================================================
# infra/aws/terraform/main.tf — CampusConnect Cloud Infrastructure (AWS)
# Declarative Infrastructure as Code (IaC) provisioning AWS Free Tier resources.
# ==============================================================================

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# ------------------------------------------------------------------------------
# 1. S3 STORAGE BUCKET (Private, Encrypted, Least Privilege)
# ------------------------------------------------------------------------------
resource "aws_s3_bucket" "campusconnect_storage" {
  bucket = var.s3_bucket_name

  tags = {
    Name        = "CampusConnect Storage"
    Environment = "Production"
    Project     = "CampusConnect"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "s3_encryption" {
  bucket = aws_s3_bucket.campusconnect_storage.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "block_public" {
  bucket = aws_s3_bucket.campusconnect_storage.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ------------------------------------------------------------------------------
# 2. IAM ROLE & INSTANCE PROFILE (Principle of Least Privilege)
# ------------------------------------------------------------------------------
resource "aws_iam_role" "ec2_s3_role" {
  name = "CampusConnect-EC2-S3-Role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "s3_least_privilege" {
  name = "CampusConnect-S3-Policy"
  role = aws_iam_role.ec2_s3_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "ListBucket"
        Effect = "Allow"
        Action = ["s3:ListBucket", "s3:GetBucketLocation"]
        Resource = aws_s3_bucket.campusconnect_storage.arn
      },
      {
        Sid    = "ReadWriteObjects"
        Effect = "Allow"
        Action = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
        Resource = "${aws_s3_bucket.campusconnect_storage.arn}/*"
      }
    ]
  })
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "CampusConnect-EC2-Profile"
  role = aws_iam_role.ec2_s3_role.name
}

# ------------------------------------------------------------------------------
# 3. SECURITY GROUP (Virtual Firewall)
# ------------------------------------------------------------------------------
resource "aws_security_group" "web_sg" {
  name        = "campusconnect-sg"
  description = "CampusConnect Web and API Inbound Traffic Filter"
  vpc_id      = var.vpc_id

  ingress {
    description = "HTTP Public Web Traffic"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Node.js Backend API Traffic"
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "SSH Administration"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "campusconnect-sg"
  }
}

# ------------------------------------------------------------------------------
# 4. COMPUTE (EC2 Virtual Machine - AWS Free Tier)
# ------------------------------------------------------------------------------
resource "aws_instance" "app_server" {
  ami                  = var.ami_id
  instance_type        = var.instance_type
  key_name             = var.key_name
  subnet_id            = var.subnet_id
  vpc_security_group_ids = [aws_security_group.web_sg.id]
  iam_instance_profile = aws_iam_instance_profile.ec2_profile.name
  user_data            = file("${path.module}/../user_data.sh")

  tags = {
    Name    = "CampusConnect-Production-Server"
    Project = "CampusConnect"
  }
}
