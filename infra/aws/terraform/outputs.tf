# ==============================================================================
# infra/aws/terraform/outputs.tf — Post-Provisioning Useful Outputs
# ==============================================================================

output "aws_account_id" {
  value       = data.aws_caller_identity.current.account_id
  description = "Active AWS Account ID"
}

output "aws_region" {
  value       = data.aws_region.current.name
  description = "Active AWS Deployment Region"
}

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

output "app_url" {
  value       = "http://${aws_instance.app_server.public_ip}"
  description = "CampusConnect Live Web Portal URL"
}

output "ssh_command" {
  value       = "ssh -i infra/keys/${var.key_name}.pem ec2-user@${aws_instance.app_server.public_ip}"
  description = "Ready-to-run SSH connection command"
}

output "s3_bucket_arn" {
  value       = aws_s3_bucket.campusconnect_storage.arn
  description = "ARN of the S3 storage bucket"
}

output "iam_role_arn" {
  value       = aws_iam_role.ec2_s3_role.arn
  description = "ARN of the EC2 Least Privilege IAM Role"
}

output "security_group_id" {
  value       = aws_security_group.web_sg.id
  description = "Security Group Firewall ID"
}
