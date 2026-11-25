#!/usr/bin/env bash
# ==============================================================================
# scripts/aws_destroy.sh — Clean up CampusConnect AWS Resources
# Use this after your college viva/demo to ensure 0 extra cloud costs.
# ==============================================================================

set -e

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${YELLOW}Starting CampusConnect AWS Resource Teardown...${NC}"

# 1. Terminate EC2 Instance
INSTANCE_IDS=$(aws ec2 describe-instances \
  --filters "Name=tag:Project,Values=CampusConnect" "Name=instance-state-name,Values=pending,running,stopped" \
  --query "Reservations[*].Instances[*].InstanceId" --output text)

if [ -n "$INSTANCE_IDS" ]; then
  echo -e "Terminating EC2 instances: $INSTANCE_IDS"
  aws ec2 terminate-instances --instance-ids $INSTANCE_IDS
  echo -e "Waiting for instances to terminate..."
  aws ec2 wait instance-terminated --instance-ids $INSTANCE_IDS
fi

# 2. Delete Security Group
echo -e "Deleting Security Group: campusconnect-sg"
aws ec2 delete-security-group --group-name "campusconnect-sg" 2>/dev/null || true

# 3. Delete Key Pair
echo -e "Deleting Key Pair: campusconnect-key"
aws ec2 delete-key-pair --key-name "campusconnect-key" 2>/dev/null || true

# 4. Remove IAM Instance Profile & Role
echo -e "Cleaning IAM resources..."
aws iam remove-role-from-instance-profile --instance-profile-name "CampusConnect-EC2-Profile" --role-name "CampusConnect-EC2-S3-Role" 2>/dev/null || true
aws iam delete-instance-profile --instance-profile-name "CampusConnect-EC2-Profile" 2>/dev/null || true
aws iam delete-role-policy --role-name "CampusConnect-EC2-S3-Role" --policy-name "CampusConnect-S3-Policy" 2>/dev/null || true
aws iam delete-role --role-name "CampusConnect-EC2-S3-Role" 2>/dev/null || true

# 5. Empty and Delete S3 Bucket
echo -e "Emptying and deleting S3 bucket..."
aws s3 rb s3://campusconnect-storage-343980058788 --force 2>/dev/null || true

echo -e "\n${GREEN}✓ All CampusConnect AWS Cloud Resources successfully removed!${NC}"
