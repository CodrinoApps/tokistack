terraform {
  cloud {
    organization = "Codrino"

    workspaces {
      project = "tokistack"
      tags    = ["cloudflare", "environment"]
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

locals {
  subdomain = var.cluster == "production" ? "app" : "app-${var.cluster}"
  fqdn      = "${local.subdomain}.${var.domain}"
}

# --- Frontend hosting (Cloudflare Workers with Static Assets) ---

resource "cloudflare_workers_script" "frontend" {
  account_id         = var.cloudflare_account_id
  script_name        = "tokistack-${var.cluster}-frontend"
  main_module        = "index.js"
  content            = file("${path.module}/scripts/frontend.js")
  compatibility_date = "2026-02-22"

  assets = {
    directory = "${path.module}/assets"
    config = {
      html_handling      = "auto-trailing-slash"
      not_found_handling = "single-page-application"
    }
  }

  lifecycle {
    ignore_changes = [content, content_sha256, assets]
  }
}

# --- Proxy Worker (API routing + frontend service binding) ---

resource "cloudflare_workers_script" "proxy" {
  account_id         = var.cloudflare_account_id
  script_name        = "tokistack-${var.cluster}-proxy"
  main_module        = "index.js"
  content            = file("${path.module}/scripts/proxy.js")
  compatibility_date = "2026-02-22"

  bindings = [
    {
      type = "plain_text"
      name = "API_GATEWAY_URL"
      text = var.api_gateway_url
    },
    {
      type = "secret_text"
      name = "ORIGIN_HEADER_SECRET"
      text = var.origin_header_secret
    },
    {
      type    = "service"
      name    = "FRONTEND"
      service = cloudflare_workers_script.frontend.script_name
    }
  ]
}

resource "cloudflare_workers_custom_domain" "proxy" {
  account_id = var.cloudflare_account_id
  hostname   = local.fqdn
  service    = cloudflare_workers_script.proxy.script_name
  zone_id    = var.zone_id

  lifecycle {
    # environment is deprecated but set to default "production" by the Cloudflare API. Ignored to prevent drift issues.
    # see https://github.com/cloudflare/terraform-provider-cloudflare/blob/main/internal/services/workers_custom_domain/schema.go#L48
    ignore_changes = [environment]
  }
}

# --- Rate limiting ---

resource "cloudflare_ruleset" "rate_limiting" {
  zone_id = var.zone_id
  name    = "Rate limiting (${var.cluster})"
  kind    = "zone"
  phase   = "http_ratelimit"

  rules = [
    {
      ref         = "rate_limit_auth"
      description = "Strict rate limit on auth endpoints"
      expression  = "(http.host eq \"${local.fqdn}\" and starts_with(http.request.uri.path, \"/api/auth/\"))"
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
