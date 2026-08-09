use std::collections::HashMap;

use aws_config::BehaviorVersion;
use aws_sdk_ssm::Client;
use db_rs::DbClient;
use email_rs::{Cluster, EmailClient};
use lambda_runtime::{Error, run, service_fn, tracing};

mod handler;
mod repository;
mod services;
mod state;

use handler::function_handler;
use state::AppState;

const DB_CONNECTION_STRING_PARAMETER: &str = "/tokistack/db-connection-string";
const RESEND_API_KEY_PARAMETER: &str = "/tokistack/resend-api-key";

async fn resolve_parameters(
    ssm: &Client,
    names: &[&str],
) -> Result<HashMap<String, String>, Error> {
    let response = ssm
        .get_parameters()
        .set_names(Some(names.iter().map(|name| name.to_string()).collect()))
        .with_decryption(true)
        .send()
        .await?;

    let invalid = response.invalid_parameters();
    if !invalid.is_empty() {
        return Err(format!("unknown SSM parameters: {}", invalid.join(", ")).into());
    }

    Ok(response
        .parameters()
        .iter()
        .filter_map(|parameter| {
            Some((
                parameter.name()?.to_string(),
                parameter.value()?.to_string(),
            ))
        })
        .collect())
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    tracing::init_default_subscriber();

    let config = aws_config::load_defaults(BehaviorVersion::latest()).await;
    let ssm = Client::new(&config);

    let cluster = Cluster::from_name(&std::env::var("CLUSTER_NAME")?)?;

    let mut parameters = resolve_parameters(
        &ssm,
        &[DB_CONNECTION_STRING_PARAMETER, RESEND_API_KEY_PARAMETER],
    )
    .await?;

    let connection_string = parameters
        .remove(DB_CONNECTION_STRING_PARAMETER)
        .ok_or_else(|| format!("SSM parameter {DB_CONNECTION_STRING_PARAMETER} is empty"))?;
    let api_key = parameters
        .remove(RESEND_API_KEY_PARAMETER)
        .ok_or_else(|| format!("SSM parameter {RESEND_API_KEY_PARAMETER} is empty"))?;

    let state = AppState {
        db: DbClient::new(&connection_string).await?,
        email: EmailClient::new(&api_key, cluster),
    };

    run(service_fn(|event| function_handler(event, &state))).await
}
