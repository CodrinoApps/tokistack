use lambda_runtime::{Error, LambdaEvent};
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub(crate) struct IncomingMessage {
    command: String,
}

#[derive(Serialize)]
pub(crate) struct OutgoingMessage {
    req_id: String,
    msg: String,
}

pub(crate) async fn function_handler(
    event: LambdaEvent<IncomingMessage>,
) -> Result<OutgoingMessage, Error> {
    let command = event.payload.command;

    let resp = OutgoingMessage {
        req_id: event.context.request_id,
        msg: format!("Command {}.", command),
    };

    Ok(resp)
}

#[cfg(test)]
mod tests {
    use super::*;
    use lambda_runtime::{Context, LambdaEvent};

    #[tokio::test]
    async fn test_handler() {
        let event = LambdaEvent::new(
            IncomingMessage {
                command: "test".to_string(),
            },
            Context::default(),
        );
        let response = function_handler(event).await.unwrap();
        assert_eq!(response.msg, "Command test.");
    }
}
