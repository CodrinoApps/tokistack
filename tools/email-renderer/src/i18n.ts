import de from "./locales/de.json";
import en from "./locales/en.json";

const locales = { en, de } as const;
export type Locale = keyof typeof locales;

export function t(locale: Locale, key: string): string {
  return (locales[locale] as Record<string, string>)[key] ?? key;
}
