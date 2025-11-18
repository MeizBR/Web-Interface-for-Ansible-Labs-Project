# Fetch the ARN of the policy named "S3BucketListReadWrite"
$s3_policy_arn = aws iam list-policies --scope Local --query "Policies[?PolicyName=='S3BucketListReadWrite'].Arn" --output text

# Check if the policy ARN was fetched successfully
if (-not $s3_policy_arn) {
    Write-Host "Error: Unable to find the policy ARN for S3BucketListReadWrite."
    exit 1
} else {
    Write-Host "Found S3 policy ARN: $s3_policy_arn"
}

# Detach S3 policy from the role
Write-Host "Detaching S3 policy from the role..."
aws iam detach-role-policy --role-name allow-ec2-s3-interaction --policy-arn $s3_policy_arn

# Check if the detach command was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host "Successfully detached the S3 policy from allow-ec2-s3-interaction role."
} else {
    Write-Host "Error: Failed to detach the S3 policy."
    exit 1
}