/// The languages emails can be sent in. Maps to the
/// prebuilt templates in `tools/email-renderer`.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum Locale {
    En,
    #[default]
    De,
}

impl Locale {
    pub fn from_language(language: &str) -> Self {
        let primary = language
            .split(['-', '_'])
            .next()
            .unwrap_or_default()
            .trim()
            .to_lowercase();

        match primary.as_str() {
            "en" => Locale::En,
            _ => Locale::default(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn defaults_to_german() {
        assert_eq!(Locale::default(), Locale::De);
    }

    #[test]
    fn resolves_supported_languages() {
        assert_eq!(Locale::from_language("de"), Locale::De);
        assert_eq!(Locale::from_language("en"), Locale::En);
    }

    #[test]
    fn is_case_and_region_insensitive() {
        assert_eq!(Locale::from_language("EN"), Locale::En);
        assert_eq!(Locale::from_language("en-US"), Locale::En);
        assert_eq!(Locale::from_language(" en_GB "), Locale::En);
    }

    #[test]
    fn falls_back_for_unknown_or_empty() {
        assert_eq!(Locale::from_language("fr"), Locale::De);
        assert_eq!(Locale::from_language(""), Locale::De);
    }
}
