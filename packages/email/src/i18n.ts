import de from "@tokistack/i18n/locales/email/de.json";
import en from "@tokistack/i18n/locales/email/en.json";

const locales = { en, de } as const;
export type Locale = keyof typeof locales;

/**
 * Resolves the displayed translation for a given language and translation key
 * @param locale
 * @param key
 * @returns
 */
export function t(locale: Locale, key: string): string {
  return (locales[locale] as Record<string, string>)[key] ?? key;
}
