use std::str::FromStr;
use std::time::Duration;

use sqlx::{
    PgPool,
    postgres::{PgConnectOptions, PgPoolOptions},
};

#[derive(Clone)]
pub struct DbClient {
    pool: PgPool,
}

impl DbClient {
    pub async fn new(connection_string: &str) -> sqlx::Result<Self> {
        let options = PgConnectOptions::from_str(connection_string)?.statement_cache_capacity(0);

        let pool = PgPoolOptions::new()
            .max_connections(2)
            .min_connections(0)
            .acquire_timeout(Duration::from_secs(10))
            .acquire_slow_threshold(Duration::from_secs(5))
            .connect_with(options)
            .await?;
        Ok(Self { pool })
    }

    pub fn pool(&self) -> &sqlx::PgPool {
        &self.pool
    }
}
