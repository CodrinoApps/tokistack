use admin_core::AdminResponse;
use lambda_runtime::{Error, tracing};

use crate::services::invite_user::{InviteUserError, invite_user};
use crate::state::AppState;

pub(super) async fn handle(
    state: &AppState,
    request_id: &str,
    email: String,
) -> Result<AdminResponse, Error> {
    match invite_user(&state.db, &state.email, &email).await {
        Ok(entry) => Ok(AdminResponse::Success {
            message: format!("Invited {}", entry.email),
        }),
        Err(InviteUserError::NotFound) => Ok(AdminResponse::Error {
            message: format!(
                "No waitlist entry found for {email}. Either unknown or already registered"
            ),
        }),
        Err(InviteUserError::Email(source)) => {
            tracing::error!(
                request_id = %request_id,
                error = %source,
                "invitation email failed to send"
            );
            Ok(AdminResponse::Error {
                message: format!(
                    "Failed to send invitation email for {email}; Re-run the command to retry"
                ),
            })
        }
        Err(err) => Err(err.into()),
    }
}
