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
