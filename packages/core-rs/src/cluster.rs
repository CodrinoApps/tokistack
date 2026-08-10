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

    pub fn name(&self) -> &str {
        match self {
            Cluster::Production => PRODUCTION,
            Cluster::Named(name) => name,
        }
    }

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
    fn production_uses_correct_app_subdomain() {
        assert_eq!(
            Cluster::from_name("production").unwrap().app_base_url(),
            "https://app.tokistack.com"
        );
    }

    #[test]
    fn non_prod_clusters_are_suffixed() {
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
    fn invalid_cluster_names_are_rejected() {
        assert_eq!(Cluster::from_name(""), Err(EmptyClusterName));
        assert_eq!(Cluster::from_name("   \t "), Err(EmptyClusterName));
    }
}
