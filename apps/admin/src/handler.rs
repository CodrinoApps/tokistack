use admin_core::{AdminCommand, AdminResponse};
use lambda_runtime::{Error, LambdaEvent};

pub(crate) async fn function_handler(
    event: LambdaEvent<AdminCommand>,
) -> Result<AdminResponse, Error> {
    match event.payload {
        AdminCommand::InviteUser { email } => Ok(AdminResponse::Success {
            message: format!("Invited {}", email),
        }),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use lambda_runtime::{Context, LambdaEvent};

    #[tokio::test]
    async fn test_handler() {
        let event = LambdaEvent::new(
            AdminCommand::InviteUser {
                email: "test@example.com".to_string(),
            },
            Context::default(),
        );
        let response = function_handler(event).await.unwrap();
        assert!(matches!(response, AdminResponse::Success { .. }));
    }
}
