terraform {
  cloud {
    organization = "Codrino"

    workspaces {
      name = "tokistack-cloudflare-testing"
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