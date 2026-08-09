use admin_core::{AdminCommand, AdminResponse};
use lambda_runtime::{Error, LambdaEvent, tracing};

use crate::state::AppState;

mod invite_user;

pub(crate) async fn function_handler(
    event: LambdaEvent<AdminCommand>,
    state: &AppState,
) -> Result<AdminResponse, Error> {
    let request_id = event.context.request_id;

    let response = match event.payload {
        AdminCommand::InviteUser { email } => {
            tracing::info!(request_id = %request_id, %email, "handling InviteUser");
            invite_user::handle(state, &request_id, email).await
        }
    };

    match &response {
        Ok(AdminResponse::Success { message }) => {
            tracing::info!(request_id = %request_id, %message, "command succeeded")
        }
        Ok(AdminResponse::Error { message }) => {
            tracing::warn!(request_id = %request_id, %message, "command rejected")
        }
        Err(error) => tracing::error!(request_id = %request_id, %error, "command failed"),
    }

    response
}
