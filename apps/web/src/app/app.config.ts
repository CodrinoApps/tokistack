import { ApplicationConfig, provideBrowserGlobalErrorListeners } from "@angular/core";
import { provideRouter, withComponentInputBinding } from "@angular/router";
import { provideDispatcher } from "@ngrx/signals/events";
import { provideStoreDevtools } from "@ngrx/store-devtools";
import { environment } from "../environments/environment";
import { routes } from "./app.routes";

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    provideStoreDevtools({ maxAge: 25, logOnly: environment.production }),
    provideDispatcher(),
  ],
};
