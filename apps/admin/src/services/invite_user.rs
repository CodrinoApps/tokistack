use crate::{repository::waitlist, services::token::generate_token};
use db_rs::{DbClient, models::waitlist::WaitlistEntry};
use email_rs::{EmailClient, Invitation, Locale};

#[derive(Debug, thiserror::Error)]
pub enum InviteUserError {
    #[error("no waitlist entry found")]
    NotFound,
    #[error("database error")]
    Database(#[from] sqlx::Error),
    #[error("failed to send invitation email")]
    Email(#[from] email_rs::Error),
}

pub async fn invite_user(
    db: &DbClient,
    email_client: &EmailClient,
    email: &str,
) -> Result<WaitlistEntry, InviteUserError> {
    let invite_token = generate_token();
    let waitlist_entry = waitlist::set_invited(db.pool(), email, &invite_token)
        .await?
        .ok_or(InviteUserError::NotFound)?;

    email_client
        .send(Invitation {
            to: waitlist_entry.email.clone(),
            locale: Locale::from_language(&waitlist_entry.language),
            invite_token,
        })
        .await?;

    Ok(waitlist_entry)
}
