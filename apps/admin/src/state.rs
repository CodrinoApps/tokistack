use db_rs::DbClient;
use email_rs::EmailClient;

pub(crate) struct AppState {
    pub db: DbClient,
    pub email: EmailClient,
}
