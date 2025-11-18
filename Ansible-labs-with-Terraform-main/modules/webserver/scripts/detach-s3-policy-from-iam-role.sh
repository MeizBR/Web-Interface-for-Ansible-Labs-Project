#!/bin/bash

# Fetch the ARN of the policy named "S3BucketListReadWrite"
s3_policy_arn=$(aws iam list-policies --scope Local --query 'Policies[?PolicyName==`S3BucketListReadWrite`].Arn' --output text)

# Check if the policy ARN was fetched successfully
if [ -z "$s3_policy_arn" ]; then
    echo "Error: Unable to find the policy ARN for S3BucketListReadWrite."
    exit 1
else
    echo "Found S3 policy ARN: $s3_policy_arn"
fi

# Detach S3 policy from the role
echo "Detaching S3 policy from the role..."
aws iam detach-role-policy --role-name allow-ec2-s3-interaction --policy-arn "$s3_policy_arn"

# Check if the detach command was successful
if [ $? -eq 0 ]; then
    echo "Successfully detached the S3 policy from allow-ec2-s3-interaction role."
else
    echo "Error: Failed to detach the S3 policy."
    exit 1
fi