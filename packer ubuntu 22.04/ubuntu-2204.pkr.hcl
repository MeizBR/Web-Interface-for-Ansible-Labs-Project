packer {
  required_plugins {
    virtualbox = {
      source = "github.com/hashicorp/virtualbox"
      version = "~> 1"
    }
  }
}

source "virtualbox-iso" "ubuntu-2204" {
  iso_url           = "https://releases.ubuntu.com/22.04/ubuntu-22.04.5-live-server-amd64.iso"
  iso_checksum      = "sha256:9bc6028870aef3f74f4e16b900008179e78b130e6b0b9a140635434a46aa98b0"

  guest_os_type     = "Ubuntu_64"
  ssh_username      = "ubuntu"
  ssh_password      = "ubuntu"
  ssh_wait_timeout  = "25m"

  headless          = true

  disk_size         = 20000
  memory            = 2048
  cpus              = 2

  http_directory    = "http"

  boot_command = [
    "<tab> autoinstall ds=nocloud-net;s=http://{{ .HTTPIP }}:{{ .HTTPPort }}/ --- <enter>"
  ]

  boot_wait = "5s"

  shutdown_command = "echo 'ubuntu' | sudo -S shutdown -P now"
}

build {
  sources = ["source.virtualbox-iso.ubuntu-2204"]

  provisioner "shell" {
    scripts = [
        "install-tools.sh",
        "configure-access.sh"
    ]
  }

  post-processor "virtualbox-export" {
    output = "ans-labs-with-tf-ubuntu-2204-virtualbox.ova"
  }
}