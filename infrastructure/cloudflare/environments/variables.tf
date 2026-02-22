variable "cluster" {
  description = "Environment cluster name (e.g. testing, production)."
  type        = string
}

variable "zone_id" {
  description = "Cloudflare zone ID (from shared workspace output)."
  type        = string
}

variable "domain" {
  description = "Root domain managed in Cloudflare."
  type        = string
}

variable "cloudflare_account_id" {
  description = "Cloudflare account ID."
  type        = string
}

variable "api_gateway_url" {
  description = "AWS API Gateway invoke URL to proxy traffic to."
  type        = string
}

variable "origin_header_secret" {
  description = "Shared secret for X-Origin-Secret header validation between Cloudflare and API Gateway."
  type        = string
  sensitive   = true
}
