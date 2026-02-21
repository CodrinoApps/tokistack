variable "cloudflare_account_id" {
  description = "Cloudflare account ID."
  type        = string
}

variable "domain" {
  description = "Root domain managed in Cloudflare."
  type        = string
  default     = "tokistack.com"
}
