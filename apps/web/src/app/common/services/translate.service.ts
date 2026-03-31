import { inject, Injectable, signal } from "@angular/core";
import type { TranslationKey } from "@tokistack/i18n/generated";
import { LocalStorageService } from "./local-storage.service";

const LOCALE_KEY = "locale";
const DEFAULT_LOCALE = "en";

@Injectable({ providedIn: "root" })
export class TranslateService {
  private readonly storage = inject(LocalStorageService);

  readonly locale = signal<string>(this.storage.getString(LOCALE_KEY) ?? DEFAULT_LOCALE);
  readonly translations = signal<Record<string, string>>({});

  async setLocale(locale: string): Promise<void> {
    const response = await fetch(`/locale/${locale}.json`);
    const data: Record<string, string> = await response.json();

    this.translations.set(data);
    this.locale.set(locale);
    this.storage.setString(LOCALE_KEY, locale);
  }

  t(key: TranslationKey): string {
    return this.translations()[key] ?? key;
  }
}
