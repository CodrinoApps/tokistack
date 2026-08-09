use clap::ValueEnum;

#[derive(Clone, ValueEnum)]
pub enum Environment {
    /// Testing environment, using the TokistackDev profile
    Dev,
    /// Production environment, using the TokistackProd profile
    Prod,
}

impl Environment {
    pub fn profile(&self) -> &str {
        match self {
            Environment::Dev => "TokistackDev",
            Environment::Prod => "TokistackProd",
        }
    }

    pub fn function_name(&self) -> &str {
        match self {
            Environment::Dev => "tokistack-testing-admin",
            Environment::Prod => "tokistack-production-admin",
        }
    }
}
