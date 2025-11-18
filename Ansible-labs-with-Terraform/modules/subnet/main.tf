resource "aws_subnet" "subnet" {
    vpc_id = var.vpc_id
    cidr_block = var.subnet_cidr_block
    availability_zone = var.subnet_avail_zone
    tags = {
        Name: "${var.env_prefix}-subnet"
    }
}

# virtual router inside vpc
resource "aws_route_table" "route_table" {
    vpc_id = var.vpc_id

    route {
        cidr_block = "0.0.0.0/0"
        gateway_id = aws_internet_gateway.igw.id
    }

    tags = {
        Name: "${var.env_prefix}-rtb"
    }
}

# virtual modem inside vpc to connect our vpc to the internet
resource "aws_internet_gateway" "igw" {
    vpc_id = var.vpc_id

    tags = {
        Name: "${var.env_prefix}-igw"
    }
}

resource "aws_route_table_association" "rtb_association_subnet" {
    subnet_id = aws_subnet.subnet.id
    route_table_id = aws_route_table.route_table.id
}