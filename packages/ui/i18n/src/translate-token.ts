import { InjectionToken } from "@angular/core";

export type TranslateFn = (key: string) => string;

export const TRANSLATE_FN = new InjectionToken<TranslateFn>("TRANSLATE_FN", {
  factory: () => (key: string) => key,
});
