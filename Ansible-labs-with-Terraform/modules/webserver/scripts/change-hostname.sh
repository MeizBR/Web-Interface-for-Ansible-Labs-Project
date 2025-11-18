#!/bin/bash

# Print a message indicating that the hostname is being changed to 'master'
echo "Changing the hostname to master"

# Change the system's hostname to 'master' using the hostnamectl command
sudo hostnamectl set-hostname master

# Update the /etc/hostname file with the new hostname 'master'
echo "master" | sudo tee /etc/hostname

# Append an entry to the /etc/hosts file, associating the localhost IP address (127.0.0.1) with the hostname 'master'
echo "127.0.0.1 master" | sudo tee -a /etc/hosts

# Print a success message indicating that the hostname has been changed
echo "Hostname changed successfully!"