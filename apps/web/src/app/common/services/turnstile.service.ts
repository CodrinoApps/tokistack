import { DOCUMENT } from "@angular/common";
import { inject, Injectable } from "@angular/core";

const TURNSTILE_SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

export interface TurnstileRenderOptions {
  sitekey: string;
  theme: "light" | "dark";
  callback: (token: string) => void;
  "error-callback": (errorCode: string) => void;
  "expired-callback": () => void;
  action?: string;
}

interface TurnstileApi {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
}

@Injectable({ providedIn: "root" })
export class TurnstileService {
  private readonly doc = inject(DOCUMENT);
  private loadPromise: Promise<void> | null = null;

  loadScript(): Promise<void> {
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = new Promise<void>((resolve, reject) => {
      const script = this.doc.createElement("script");
      script.src = TURNSTILE_SCRIPT_URL;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Turnstile script"));
      this.doc.head.appendChild(script);
    });

    return this.loadPromise;
  }

  render(container: HTMLElement, options: TurnstileRenderOptions): string {
    return this.api().render(container, options);
  }

  reset(widgetId: string): void {
    this.api().reset(widgetId);
  }

  remove(widgetId: string): void {
    this.api().remove(widgetId);
  }

  private api(): TurnstileApi {
    return (this.doc.defaultView as unknown as Window & { turnstile: TurnstileApi }).turnstile;
  }
}
