mod client;
mod email;
mod locale;
mod templates;

pub use client::EmailClient;
pub use email::{Email, Invitation, ResolvedEmail};
pub use locale::Locale;
pub use resend_rs::{Error, Result};
