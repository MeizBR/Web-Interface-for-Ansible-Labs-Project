#!/bin/bash

# Update the package list
echo "Updating package list..."
sudo yum update -y

# Install EPEL repository (Extra Packages for Enterprise Linux)
echo "Installing EPEL repository..."
sudo amazon-linux-extras install epel -y

# Install Ansible
echo "Installing Ansible..."
sudo yum install -y ansible

# Verify the installation
echo "Verifying Ansible installation..."
ansible --version

echo "Ansible installation complete!"