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
  default     = "tokistack.com"
}

variable "api_gateway_url" {
  description = "AWS API Gateway invoke URL to proxy traffic to."
  type        = string
}
