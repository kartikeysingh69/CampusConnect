# ==============================================================================
# infra/aws/terraform/main.tf — CampusConnect Cloud Infrastructure (AWS)
# Industry-Standard Declarative Infrastructure as Code (IaC)
# Demonstrates: Data Sources, S3 Storage, IAM Least Privilege, Security Groups, EC2
# ==============================================================================

# ------------------------------------------------------------------------------
# 0. DATA SOURCES (Dynamic Account & Environment Inspection)
# ------------------------------------------------------------------------------
data "aws_caller_identity" "current" {}

data "aws_region" "current" {}

# ------------------------------------------------------------------------------
# 1. S3 STORAGE BUCKET (Private, Encrypted, Least Privilege)
# ------------------------------------------------------------------------------
resource "aws_s3_bucket" "campusconnect_storage" {
  bucket = var.s3_bucket_name

  tags = {
    Name = "CampusConnect Storage"
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
        Sid      = "AllowS3BucketListing"
        Effect   = "Allow"
        Action   = ["s3:ListBucket", "s3:GetBucketLocation"]
        Resource = aws_s3_bucket.campusconnect_storage.arn
      },
      {
        Sid      = "AllowS3ObjectReadWrite"
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
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
# 3. SECURITY GROUP (Virtual Stateful Firewall)
# ------------------------------------------------------------------------------
resource "aws_security_group" "web_sg" {
  name        = "campusconnect-sg"
  description = "CampusConnect Web and API Security Group"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
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
# 4. COMPUTE (EC2 Virtual Machine - AWS Free Tier t3.micro)
# ------------------------------------------------------------------------------
resource "aws_instance" "app_server" {
  ami                    = var.ami_id
  instance_type          = var.instance_type
  key_name               = var.key_name
  subnet_id              = var.subnet_id
  vpc_security_group_ids = [aws_security_group.web_sg.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2_profile.name
  user_data              = file("${path.module}/../user_data.sh")

  root_block_device {
    volume_size           = 8
    volume_type           = "gp3"
    delete_on_termination = true
  }

  lifecycle {
    # Prevent changing bootstrap script later from destroying a running prod VM
    ignore_changes = [user_data]
  }

  tags = {
    Name = "CampusConnect-Production-Server"
  }
}
