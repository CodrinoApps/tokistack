use resend_rs::types::CreateEmailBaseOptions;
use resend_rs::{Resend, Result};

use crate::cluster::Cluster;
use crate::email::{Email, ResolvedEmail};

const SENDER: &str = "Tokistack <noreply@tokistack.com>";

/// Sends transactional Tokistack emails through Resend using the prebuilt,
/// localized templates.
pub struct EmailClient {
    resend: Resend,
    from: &'static str,
    cluster: Cluster,
}

impl EmailClient {
    pub fn new(api_key: &str, cluster: Cluster) -> Self {
        Self {
            resend: Resend::new(api_key),
            from: SENDER,
            cluster,
        }
    }

    /// Resolves the given email to its localized content and sends it.
    pub async fn send(&self, email: impl Email) -> Result<()> {
        let ResolvedEmail { to, subject, html } = email.resolve(&self.cluster);

        let options = CreateEmailBaseOptions::new(self.from, [to], subject).with_html(&html);
        self.resend.emails.send(options).await?;

        Ok(())
    }
}
