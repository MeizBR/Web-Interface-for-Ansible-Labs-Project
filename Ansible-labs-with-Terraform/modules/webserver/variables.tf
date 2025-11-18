variable vpc_id {}
variable ip_addresses_range {}
variable env_prefix {}
variable image_name {}
variable instance_type {}
variable subnet_id {}
variable subnet_avail_zone {}
variable configuration {
  description = "EC2 configuration"
  default = [{}]
}
variable key_name {}
variable private_key_location {}
variable os {}