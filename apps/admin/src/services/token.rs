use rand::distr::{Alphanumeric, SampleString};

pub fn generate_token() -> String {
    Alphanumeric.sample_string(&mut rand::rng(), 43)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn tokens_are_url_safe() {
        let token = generate_token();

        assert_eq!(token.len(), 43);
        assert!(token.chars().all(|c| c.is_ascii_alphanumeric()));
    }
}
