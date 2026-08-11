use std::time::SystemTime;

use aws_config::BehaviorVersion;
use aws_sdk_ssm::Client;
use core_rs::cluster::Cluster;
use core_rs::{instrumentation, ssm};
use db_rs::DbClient;
use email_rs::EmailClient;
use lambda_runtime::{Error, Runtime, service_fn};

mod handler;
mod repository;
mod services;
mod state;

use handler::function_handler;
use state::AppState;

const DB_CONNECTION_STRING_PARAMETER: &str = "/tokistack/db-connection-string";
const RESEND_API_KEY_PARAMETER: &str = "/tokistack/resend-api-key";
const NEW_RELIC_LICENSE_KEY_PARAMETER: &str = "/tokistack/new-relic-license-key";

#[tokio::main]
async fn main() -> Result<(), Error> {
    let started = SystemTime::now();

    let config = aws_config::load_defaults(BehaviorVersion::latest()).await;
    let ssm_client = Client::new(&config);

    let cluster = Cluster::from_name(&std::env::var("CLUSTER_NAME")?)?;

    let [connection_string, resend_api_key, new_relic_license_key] = ssm::resolve(
        &ssm_client,
        [
            DB_CONNECTION_STRING_PARAMETER,
            RESEND_API_KEY_PARAMETER,
            NEW_RELIC_LICENSE_KEY_PARAMETER,
        ],
    )
    .await?;
    let ssm_done = SystemTime::now();

    let telemetry = instrumentation::init(&cluster, new_relic_license_key, "tokistack-admin")?;
    let telemetry_done = SystemTime::now();

    let db = DbClient::new(&connection_string).await?;
    let db_done = SystemTime::now();

    telemetry.record_cold_start(&[
        ("config_and_ssm", started, ssm_done),
        ("telemetry_init", ssm_done, telemetry_done),
        ("db_connect", telemetry_done, db_done),
    ]);

    let state = AppState {
        db,
        email: EmailClient::new(&resend_api_key, cluster),
    };

    Runtime::new(service_fn(|event| function_handler(event, &state)))
        .layer(telemetry.layer())
        .run()
        .await
}
