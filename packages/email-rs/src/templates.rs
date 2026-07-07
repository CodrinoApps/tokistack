//! Access to the prebuilt, per locale email assets produced by
//! `tools/email-renderer`.

use std::collections::HashMap;

use crate::locale::Locale;

const INVITE_HTML_EN: &str =
    include_str!("../../../tools/email-renderer/src/generated/user-invite-en.html");
const INVITE_HTML_DE: &str =
    include_str!("../../../tools/email-renderer/src/generated/user-invite-de.html");

const LOCALE_EN: &str = include_str!("../../../tools/email-renderer/src/locales/en.json");
const LOCALE_DE: &str = include_str!("../../../tools/email-renderer/src/locales/de.json");

/// The prebuilt invitation HTML for the given locale.
pub fn invite_html(locale: &Locale) -> &'static str {
    match locale {
        Locale::En => INVITE_HTML_EN,
        Locale::De => INVITE_HTML_DE,
    }
}

/// Resolves a localized string by key, falling back to the key itself when it
/// is missing.
pub fn localized(locale: &Locale, key: &str) -> String {
    let raw = match locale {
        Locale::En => LOCALE_EN,
        Locale::De => LOCALE_DE,
    };
    let translations: HashMap<String, String> =
        serde_json::from_str(raw).expect("embedded locale JSON is valid");

    translations
        .get(key)
        .cloned()
        .unwrap_or_else(|| key.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn resolves_subject_per_locale() {
        assert_eq!(
            localized(&Locale::En, "email.invite.subject"),
            "Your Tokistack spot is ready"
        );
        assert_eq!(
            localized(&Locale::De, "email.invite.subject"),
            "Dein Tokistack-Platz ist bereit"
        );
    }

    #[test]
    fn falls_back_to_key_when_missing() {
        assert_eq!(localized(&Locale::En, "does.not.exist"), "does.not.exist");
    }

    #[test]
    fn invite_html_carries_placeholders() {
        let html = invite_html(&Locale::En);
        assert!(html.contains("{{environment}}"));
        assert!(html.contains("{{invite_token}}"));
        assert!(html.contains("{{user_email}}"));
    }
}
