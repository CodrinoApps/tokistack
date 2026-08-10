use core_rs::admin::{AdminCommand, AdminResponse};
use lambda_runtime::{Error, LambdaEvent, tracing};

use crate::state::AppState;

mod invite_user;

pub(crate) async fn function_handler(
    event: LambdaEvent<AdminCommand>,
    state: &AppState,
) -> Result<AdminResponse, Error> {
    tracing::Span::current().record("otel.kind", "SERVER");

    let request_id = event.context.request_id;

    let response = match event.payload {
        AdminCommand::InviteUser { email } => {
            tracing::info!(request_id = %request_id, "handling InviteUser");
            invite_user::handle(state, &request_id, email).await
        }
    };

    match &response {
        Ok(AdminResponse::Success { .. }) => {
            tracing::info!(request_id = %request_id, "command succeeded")
        }
        Ok(AdminResponse::Error { .. }) => {
            tracing::warn!(request_id = %request_id, "command rejected")
        }
        Err(error) => tracing::error!(request_id = %request_id, %error, "command failed"),
    }

    response
}
