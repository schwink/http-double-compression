group "default" {
  targets = ["http-double-compression"]
}

target "http-double-compression" {
  context = "."
  dockerfile = "Dockerfile"
  platforms = ["linux/amd64", "linux/arm64"]
  tags = ["schwink/http-double-compression:latest"]
}