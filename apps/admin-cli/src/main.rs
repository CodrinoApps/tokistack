mod environment;
mod lambda;

use admin_core::{AdminCommand, AdminResponse};
use clap::{Parser, Subcommand};

use crate::{environment::Environment, lambda::invoke};
use anyhow::{Context, Result};

#[derive(Parser)]
struct Cli {
    #[arg(long, default_value = "dev")]
    env: Environment,

    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    InviteUser {
        #[arg(long)]
        email: String,
    },
}

impl From<Commands> for AdminCommand {
    fn from(cli: Commands) -> Self {
        match cli {
            Commands::InviteUser { email } => AdminCommand::InviteUser { email },
        }
    }
}

#[::tokio::main]
async fn main() -> Result<()> {
    let cli = Cli::parse();
    let command = AdminCommand::from(cli.command);
    let payload = serde_json::to_string(&command).context("failed to serialize command")?;

    println!("invoking admin lambda with command: {:#?}", command);

    match invoke(&cli.env, payload).await? {
        AdminResponse::Success { message } => {
            println!("{message}");
            Ok(())
        }
        AdminResponse::Error { message } => Err(anyhow::anyhow!(message)),
    }
}
