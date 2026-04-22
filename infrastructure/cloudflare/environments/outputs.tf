output "workers_script_name" {
  description = "Name of the frontend Workers script."
  value       = cloudflare_workers_script.frontend.script_name
}

output "proxy_script_name" {
  description = "Name of the proxy Workers script."
  value       = cloudflare_workers_script.proxy.script_name
}

output "frontend_url" {
  description = "Public URL for the frontend."
  value       = "https://${local.fqdn}"
}

output "turnstile_site_key" {
  description = "Turnstile site key for frontend embedding."
  value       = cloudflare_turnstile_widget.waitlist.sitekey
}

output "ci_service_token_client_id" {
  description = "Cloudflare Access service token client ID."
  value       = length(cloudflare_zero_trust_access_service_token.ci) > 0 ? cloudflare_zero_trust_access_service_token.ci[0].client_id : null
}

output "ci_service_token_client_secret" {
  description = "Cloudflare Access service token client secret."
  value       = length(cloudflare_zero_trust_access_service_token.ci) > 0 ? cloudflare_zero_trust_access_service_token.ci[0].client_secret : null
  sensitive   = true
}
