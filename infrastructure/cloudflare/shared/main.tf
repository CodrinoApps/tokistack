terraform {
  cloud {
    organization = "Codrino"

    workspaces {
      name = "tokistack-cloudflare-shared"
    }
  }

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
  }
}

provider "cloudflare" {}

# --- Zone ---

resource "cloudflare_zone" "main" {
  account = {
    id = var.cloudflare_account_id
  }
  name = var.domain
}

# --- Zone-wide settings ---

resource "cloudflare_zone_setting" "always_use_https" {
  zone_id    = cloudflare_zone.main.id
  setting_id = "always_use_https"
  value      = "on"
}

# --- Security ---

resource "cloudflare_bot_management" "default" {
  zone_id    = cloudflare_zone.main.id
  fight_mode = true
  enable_js  = true
}

resource "cloudflare_leaked_credential_check" "default" {
  zone_id = cloudflare_zone.main.id
  enabled = true
}

# --- Rate limiting ---

resource "cloudflare_ruleset" "rate_limiting" {
  zone_id = cloudflare_zone.main.id
  name    = "Rate limiting"
  kind    = "zone"
  phase   = "http_ratelimit"

  rules = [
    {
      ref         = "rate_limit_sensitive_endpoints"
      description = "Strict rate limit on auth and waitlist endpoints"
      expression  = "(starts_with(http.request.uri.path, \"/api/auth/\") or starts_with(http.request.uri.path, \"/api/waitlist/\"))"
      action      = "block"
      enabled     = true
      ratelimit = {
        characteristics     = ["cf.colo.id", "ip.src"]
        period              = 10
        requests_per_period = 2
        mitigation_timeout  = 10
      }
    }
  ]
}
