import de from "@tokistack/i18n/locales/email/de.json" with { type: "json" };
import en from "@tokistack/i18n/locales/email/en.json" with { type: "json" };

const locales = { en, de } as const;
export type Locale = keyof typeof locales;

export function t(locale: Locale, key: string): string {
  return (locales[locale] as Record<string, string>)[key] ?? key;
}
