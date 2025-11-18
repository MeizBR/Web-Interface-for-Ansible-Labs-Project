resource "random_string" "random_password" {
  length           = 20
  special          = true
  override_special = "/@$*~"
}