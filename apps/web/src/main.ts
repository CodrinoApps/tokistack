import { bootstrapApplication } from "@angular/platform-browser";
import { App } from "./app/app";
import { appConfig } from "./app/app.config";

bootstrapApplication(App, appConfig)
  // eslint-disable-next-line no-console
  .catch((err) => console.error(err));
