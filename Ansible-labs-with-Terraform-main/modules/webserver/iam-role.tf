resource "aws_iam_policy" "S3BucketListReadWrite" {
  name        = "S3BucketListReadWrite"
  description = "Policy to read/write and list objects in the ansible-labs bucket"

  policy = <<EOT
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::ansible-labs",
        "arn:aws:s3:::ansible-labs/*"
      ]
    }
  ]
}
EOT

    tags = {
        Name: "${var.env_prefix}-ihrm_policy"
    }
}

resource "aws_iam_policy" "EC2DescribeInstances" {
  name        = "EC2DescribeInstances"
  description = "Policy to describe EC2 instances for Ansible inventory"

  policy = <<EOT
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeInstances"
      ],
      "Resource": "*"
    }
  ]
}
EOT

  tags = {
    Name = "${var.env_prefix}-ec2_describe_instances_policy"
  }
}

resource "aws_iam_role" "allow_ec2_s3_interaction" {
  name = "allow-ec2-s3-interaction"

  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Effect = "Allow",
        Principal = {
          Service = "ec2.amazonaws.com"
        },
        Action = "sts:AssumeRole"
      }
    ]
  })

    tags = {
        Name: "${var.env_prefix}-ihrm_iam_role"
    }
}

resource "aws_iam_role_policy_attachment" "attach_s3_policy_to_ec2_role" {
  role       = aws_iam_role.allow_ec2_s3_interaction.name
  policy_arn = aws_iam_policy.S3BucketListReadWrite.arn
}

resource "aws_iam_role_policy_attachment" "attach_ec2_policy_to_ec2_role" {
  role       = aws_iam_role.allow_ec2_s3_interaction.name
  policy_arn = aws_iam_policy.EC2DescribeInstances.arn
}

resource "aws_iam_instance_profile" "ec2_instance_profile" {
  name = "ec2-instance-profile"
  role = aws_iam_role.allow_ec2_s3_interaction.name

    tags = {
        Name: "${var.env_prefix}-ihrm_iam_instance_profile"
    }
}