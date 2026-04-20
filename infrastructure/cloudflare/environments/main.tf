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

# --- Turnstile ---

resource "cloudflare_turnstile_widget" "waitlist" {
  account_id = var.cloudflare_account_id
  name       = "tokistack-${var.cluster}-waitlist"
  mode       = "managed"
  domains    = [local.fqdn]
}

# --- Zero Trust Access (testing-env only) ---

resource "cloudflare_zero_trust_access_policy" "email_otp" {
  count      = var.cluster != "production" ? 1 : 0
  account_id = var.cloudflare_account_id
  name       = "tokistack-${var.cluster}-org-email-otp"
  decision   = "allow"

  include = [
    {
      email_domain = { domain = var.access_email_domain }
    }
  ]
}

resource "cloudflare_zero_trust_access_service_token" "ci" {
  count      = var.cluster != "production" ? 1 : 0
  account_id = var.cloudflare_account_id
  name       = "tokistack-${var.cluster}-ci"
  duration   = "4380h"
}

resource "cloudflare_zero_trust_access_policy" "service_token" {
  count      = var.cluster != "production" ? 1 : 0
  account_id = var.cloudflare_account_id
  name       = "tokistack-${var.cluster}-ci-service-token"
  decision   = "non_identity"

  include = [
    {
      service_token = { token_id = cloudflare_zero_trust_access_service_token.ci[0].id }
    }
  ]
}

resource "cloudflare_zero_trust_access_application" "env" {
  count            = var.cluster != "production" ? 1 : 0
  account_id       = var.cloudflare_account_id
  name             = "tokistack-${var.cluster}"
  domain           = local.fqdn
  type             = "self_hosted"
  session_duration = "24h"

  policies = [
    {
      id         = cloudflare_zero_trust_access_policy.email_otp[0].id
      precedence = 1
    },
    {
      id         = cloudflare_zero_trust_access_policy.service_token[0].id
      precedence = 2
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
