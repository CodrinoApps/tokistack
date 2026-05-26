use lambda_runtime::{Error, run, service_fn, tracing};
mod handler;
use handler::function_handler;

#[tokio::main]
async fn main() -> Result<(), Error> {
    tracing::init_default_subscriber();

    run(service_fn(function_handler)).await
}
