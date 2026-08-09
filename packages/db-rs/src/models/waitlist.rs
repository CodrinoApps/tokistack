use chrono::NaiveDateTime;

#[derive(Debug, Clone, Copy, PartialEq, Eq, sqlx::Type)]
#[sqlx(type_name = "tokistack.waitlist_status", rename_all = "lowercase")]
pub enum WaitlistStatus {
    Pending,
    Invited,
    Registered,
}

#[derive(Debug, Clone)]
pub struct WaitlistEntry {
    pub email: String,
    pub status: WaitlistStatus,
    pub language: String,
    pub token: Option<String>,
    pub invited_at: Option<NaiveDateTime>,
    pub created_at: NaiveDateTime,
}
