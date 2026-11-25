#!/usr/bin/env bash
# ==============================================================================
# scripts/aws_status.sh — Inspect CampusConnect AWS Cloud Resources
# ==============================================================================

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}   CampusConnect Cloud Infrastructure Status (AWS)    ${NC}"
echo -e "${BLUE}======================================================${NC}"

echo -e "\n${YELLOW}1. EC2 Compute Instances:${NC}"
aws ec2 describe-instances \
  --filters "Name=tag:Project,Values=CampusConnect" "Name=instance-state-name,Values=pending,running,stopped" \
  --query "Reservations[*].Instances[*].[InstanceId,State.Name,InstanceType,PublicIpAddress,PublicDnsName]" \
  --output table

echo -e "\n${YELLOW}2. S3 Storage Buckets:${NC}"
aws s3 ls | grep "campusconnect" || echo "No CampusConnect buckets found."

echo -e "\n${YELLOW}3. Security Group Firewalls:${NC}"
aws ec2 describe-security-groups \
  --group-names "campusconnect-sg" \
  --query "SecurityGroups[*].[GroupId,GroupName,VpcId]" \
  --output table

echo -e "\n${YELLOW}4. IAM Role & Instance Profile:${NC}"
aws iam get-instance-profile \
  --instance-profile-name "CampusConnect-EC2-Profile" \
  --query "InstanceProfile.[InstanceProfileName,Roles[0].RoleName]" \
  --output table
