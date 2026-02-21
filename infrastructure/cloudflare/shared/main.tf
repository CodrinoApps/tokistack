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
