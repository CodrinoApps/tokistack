import { inject, provideAppInitializer } from "@angular/core";
import { TranslationKey } from "@tokistack/i18n/generated";
import en from "@tokistack/i18n/locales/en.json";
import { TRANSLATE_FN } from "@tokistack/ui/i18n";
import { TranslateService } from "./app/common/services/translate.service";

export default [
  {
    provide: TRANSLATE_FN,
    useFactory: () => {
      const translate = inject(TranslateService);
      return (key: string) => translate.t(key as TranslationKey);
    },
  },
  provideAppInitializer(() => {
    const translate = inject(TranslateService);
    translate.translations.set(en as Record<string, string>);
  }),
];
