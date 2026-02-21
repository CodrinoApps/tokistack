output "zone_id" {
  description = "Cloudflare zone ID for the domain."
  value       = cloudflare_zone.main.id
}

output "nameservers" {
  description = "Cloudflare nameservers to configure at the domain registrar."
  value       = cloudflare_zone.main.name_servers
}
