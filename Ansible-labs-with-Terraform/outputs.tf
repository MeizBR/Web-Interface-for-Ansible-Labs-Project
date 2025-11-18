# Master instance
output "ec2_master_instance_instance_name" {
    value = module.webserver.master_instance.tags.Name
}

output "ec2_master_instance_public_ip" {
    value = module.webserver.master_instance.public_ip
}


# Clients instances
output "ec2_clients_instances_instances_names" {
    value = [for i in module.webserver.clients_instances : i.tags.Name]
}

output "ec2_clients_instances_public_ips" {
    value = [for i in module.webserver.clients_instances : i.public_ip]
}

# display random generated password
output "random_password_output" {
    value = module.webserver.generated_random_password.result
}

# display random generated password
output "my_public_ip_output" {
    value = "${chomp(module.webserver.my_public_ip.response_body)}"
}