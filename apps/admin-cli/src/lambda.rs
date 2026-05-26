use crate::environment::Environment;
use admin_core::AdminResponse;
use anyhow::{Context, Result};
use aws_sdk_lambda::primitives::Blob;

pub async fn invoke(env: &Environment, payload: String) -> Result<AdminResponse> {
    let config = aws_config::from_env()
        .profile_name(env.profile())
        .load()
        .await;

    let client = aws_sdk_lambda::Client::new(&config);

    let response = client
        .invoke()
        .function_name(env.function_name())
        .payload(Blob::new(payload))
        .send()
        .await
        .context("lambda invocation failed")?;

    let response_blob = response
        .payload()
        .ok_or_else(|| anyhow::anyhow!("missing payload in lambda response"))?;

    serde_json::from_slice::<AdminResponse>(response_blob.as_ref())
        .context("failed to deserialize lambda payload")
}
