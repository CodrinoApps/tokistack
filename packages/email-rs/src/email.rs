use crate::cluster::Cluster;
use crate::locale::Locale;
use crate::templates;

pub struct ResolvedEmail {
    pub to: String,
    pub subject: String,
    pub html: String,
}

pub trait Email {
    fn resolve(&self, cluster: &Cluster) -> ResolvedEmail;
}

/// Invitation email sent to a user who has been invited to Tokistack.
pub struct Invitation {
    pub to: String,
    pub locale: Locale,
    pub invite_token: String,
}

impl Email for Invitation {
    fn resolve(&self, cluster: &Cluster) -> ResolvedEmail {
        let subject = templates::localized(&self.locale, "email.invite.subject");
        let html = templates::invite_html(&self.locale)
            .replace("{{app_url}}", &cluster.app_base_url())
            .replace("{{invite_token}}", &self.invite_token);

        ResolvedEmail {
            to: self.to.clone(),
            subject,
            html,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn invitation() -> Invitation {
        Invitation {
            to: "user@example.com".to_string(),
            locale: Locale::En,
            invite_token: "tok_123".to_string(),
        }
    }

    #[test]
    fn resolves_invitation_content() {
        let resolved = invitation().resolve(&Cluster::from_name("testing").unwrap());

        assert_eq!(resolved.to, "user@example.com");
        assert_eq!(resolved.subject, "Your Tokistack spot is ready");
        assert!(
            resolved
                .html
                .contains("https://app-testing.tokistack.com/invite?token=tok_123")
        );
        assert!(!resolved.html.contains("user@example.com"));
        assert!(!resolved.html.contains("{{"));
    }

    #[test]
    fn links_to_the_production_app_from_production() {
        let resolved = invitation().resolve(&Cluster::Production);

        assert!(
            resolved
                .html
                .contains("https://app.tokistack.com/invite?token=tok_123")
        );
    }
}
