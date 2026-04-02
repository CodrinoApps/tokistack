import { DOCUMENT } from "@angular/common";
import { computed, DestroyRef, effect, inject, Injectable, signal } from "@angular/core";
import { LocalStorageService } from "./local-storage.service";

export type Theme = "light" | "dark" | "system";

const THEME_KEY = "theme";
const DEFAULT_THEME: Theme = "system";
const DARK_MEDIA_QUERY = "(prefers-color-scheme: dark)";

function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark" || value === "system";
}

@Injectable({ providedIn: "root" })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);
  private readonly storage = inject(LocalStorageService);
  private readonly prefersDark = signal(
    this.doc.defaultView!.matchMedia(DARK_MEDIA_QUERY).matches,
  );

  readonly theme = signal<Theme>(this.storedTheme());
  readonly resolvedTheme = computed<"light" | "dark">(() => {
    const t = this.theme();
    if (t === "system") return this.prefersDark() ? "dark" : "light";
    return t;
  });

  constructor() {
    const mediaQuery = this.doc.defaultView!.matchMedia(DARK_MEDIA_QUERY);
    const handler = (e: MediaQueryListEvent) => this.prefersDark.set(e.matches);
    mediaQuery.addEventListener("change", handler);
    inject(DestroyRef).onDestroy(() => mediaQuery.removeEventListener("change", handler));

    effect(() => {
      this.doc.documentElement.setAttribute("data-theme", this.resolvedTheme());
    });
  }

  setTheme(theme: Theme): void {
    const apply = () => {
      this.theme.set(theme);
      this.storage.setString(THEME_KEY, theme);
    };

    if (this.doc.startViewTransition) {
      this.doc.startViewTransition(apply);
    } else {
      apply();
    }
  }

  private storedTheme(): Theme {
    const stored = this.storage.getString(THEME_KEY);
    return isTheme(stored) ? stored : DEFAULT_THEME;
  }
}
