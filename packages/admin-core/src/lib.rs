use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub enum AdminCommand {
    InviteUser { email: String },
}

#[derive(Serialize, Deserialize, Debug)]
pub enum AdminResponse {
    Success { message: String },
    Error { message: String },
}
