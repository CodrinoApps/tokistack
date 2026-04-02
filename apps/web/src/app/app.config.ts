import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from "@angular/core";
import { provideRouter, withComponentInputBinding } from "@angular/router";
import { provideDispatcher } from "@ngrx/signals/events";
import { provideStoreDevtools } from "@ngrx/store-devtools";
import { environment } from "../environments/environment";
import { routes } from "./app.routes";
import { ThemeService } from "./common/services/theme.service";
import { TranslateService } from "./common/services/translate.service";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideStoreDevtools({ maxAge: 25, logOnly: environment.production }),
    provideDispatcher(),
    provideAppInitializer(() => {
      inject(ThemeService);
      const translate = inject(TranslateService);
      return translate.setLocale(translate.locale());
    }),
  ],
};
