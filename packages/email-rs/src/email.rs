use crate::locale::Locale;
use crate::templates;

pub struct ResolvedEmail {
    pub to: String,
    pub subject: String,
    pub html: String,
}

pub trait Email {
    fn resolve(&self, environment: &str) -> ResolvedEmail;
}

/// Invitation email sent to a user who has been invited to Tokistack.
pub struct Invitation {
    pub to: String,
    pub locale: Locale,
    pub invite_token: String,
}

impl Email for Invitation {
    fn resolve(&self, environment: &str) -> ResolvedEmail {
        let subject = templates::localized(&self.locale, "email.invite.subject");
        let html = templates::invite_html(&self.locale)
            .replace("{{environment}}", environment)
            .replace("{{invite_token}}", &self.invite_token)
            .replace("{{user_email}}", &self.to);

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

    #[test]
    fn resolves_invitation_content() {
        let invitation = Invitation {
            to: "user@example.com".to_string(),
            locale: Locale::En,
            invite_token: "tok_123".to_string(),
        };

        let resolved = invitation.resolve("dev");

        assert_eq!(resolved.to, "user@example.com");
        assert_eq!(resolved.subject, "Your Tokistack spot is ready");
        assert!(
            resolved
                .html
                .contains("https://dev.tokistack.com/invite?token=tok_123&email=user@example.com")
        );
        assert!(!resolved.html.contains("{{"));
    }
}
