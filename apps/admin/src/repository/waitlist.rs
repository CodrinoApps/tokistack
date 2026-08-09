use db_rs::models::waitlist::{WaitlistEntry, WaitlistStatus};
use sqlx::PgExecutor;

pub async fn set_invited(
    executor: impl PgExecutor<'_>,
    email: &str,
    token: &str,
) -> sqlx::Result<Option<WaitlistEntry>> {
    sqlx::query_as!(
        WaitlistEntry,
        r#"UPDATE tokistack.waitlist
           SET status     = 'invited'::tokistack.waitlist_status,
               token      = $1,
               invited_at = NOW()
           WHERE email = $2
             AND status <> 'registered'::tokistack.waitlist_status
           RETURNING
               email,
               status AS "status: WaitlistStatus",
               language,
               token,
               invited_at,
               created_at"#,
        token,
        email
    )
    .fetch_optional(executor)
    .await
}
