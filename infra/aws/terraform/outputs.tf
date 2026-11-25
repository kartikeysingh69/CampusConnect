# ==============================================================================
# infra/aws/terraform/outputs.tf
# ==============================================================================

output "instance_id" {
  value       = aws_instance.app_server.id
  description = "EC2 Instance ID"
}

output "public_ip" {
  value       = aws_instance.app_server.public_ip
  description = "Public IPv4 address of the CampusConnect server"
}

output "public_dns" {
  value       = aws_instance.app_server.public_dns
  description = "Public DNS name of the EC2 instance"
}

output "s3_bucket_arn" {
  value       = aws_s3_bucket.campusconnect_storage.arn
  description = "ARN of the S3 storage bucket"
}

output "security_group_id" {
  value       = aws_security_group.web_sg.id
  description = "Security Group ID"
}
