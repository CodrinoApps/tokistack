/// The deployment cluster an email is sent from. Resolves the public web app
/// URL that email links point at.
///
/// Mirrors the subdomain rule in
/// `infrastructure/cloudflare/environments/main.tf`: production is served from
/// `app`, every other cluster from `app-<cluster>`.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Cluster {
    Production,
    Named(String),
}

const DOMAIN: &str = "tokistack.com";
const PRODUCTION: &str = "production";

#[derive(Debug, Clone, PartialEq, Eq, thiserror::Error)]
#[error("cluster name must not be empty")]
pub struct EmptyClusterName;

impl Cluster {
    pub fn from_name(name: &str) -> Result<Self, EmptyClusterName> {
        let name = name.trim().to_lowercase();

        match name.as_str() {
            "" => Err(EmptyClusterName),
            PRODUCTION => Ok(Cluster::Production),
            _ => Ok(Cluster::Named(name)),
        }
    }

    /// The base URL of the web app for this cluster, without a trailing slash.
    pub fn app_base_url(&self) -> String {
        match self {
            Cluster::Production => format!("https://app.{DOMAIN}"),
            Cluster::Named(name) => format!("https://app-{name}.{DOMAIN}"),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn production_uses_the_bare_app_subdomain() {
        assert_eq!(
            Cluster::from_name("production").unwrap().app_base_url(),
            "https://app.tokistack.com"
        );
    }

    #[test]
    fn other_clusters_are_suffixed() {
        assert_eq!(
            Cluster::from_name("testing").unwrap().app_base_url(),
            "https://app-testing.tokistack.com"
        );
    }

    #[test]
    fn cluster_names_are_case_and_whitespace_insensitive() {
        assert_eq!(Cluster::from_name(" Production "), Ok(Cluster::Production));
        assert_eq!(
            Cluster::from_name("Testing"),
            Ok(Cluster::Named("testing".to_string()))
        );
    }

    #[test]
    fn empty_cluster_names_are_rejected() {
        assert_eq!(Cluster::from_name(""), Err(EmptyClusterName));
        assert_eq!(Cluster::from_name("   \t "), Err(EmptyClusterName));
    }
}
