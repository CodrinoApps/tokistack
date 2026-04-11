import {
  afterNextRender,
  DestroyRef,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  output,
  untracked,
} from "@angular/core";
import { ThemeService } from "../services/theme.service";
import { TurnstileService } from "../services/turnstile.service";

@Directive({ selector: "[appTurnstile]" })
export class TurnstileDirective {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly turnstile = inject(TurnstileService);
  private readonly theme = inject(ThemeService);

  readonly sitekey = input.required<string>();
  readonly action = input<string>();

  readonly token = output<string>();
  readonly widgetError = output<string>();
  readonly expired = output<void>();

  private widgetId: string | null = null;
  private rendered = false;

  constructor() {
    afterNextRender({
      write: () => {
        this.turnstile.loadScript()
          .then(() => {
            this.renderWidget(this.theme.resolvedTheme());
            this.rendered = true;
          })
          .catch(() => this.widgetError.emit("script-load-error"));
      },
    });

    effect(() => {
      const resolvedTheme = this.theme.resolvedTheme();
      if (this.rendered) {
        untracked(() => this.reRenderWidget(resolvedTheme));
      }
    });

    inject(DestroyRef).onDestroy(() => {
      if (this.widgetId !== null) {
        this.turnstile.remove(this.widgetId);
      }
    });
  }

  reset(): void {
    if (this.widgetId !== null) {
      this.turnstile.reset(this.widgetId);
    }
  }

  private renderWidget(theme: "light" | "dark"): void {
    this.widgetId = this.turnstile.render(this.el.nativeElement, {
      sitekey: this.sitekey(),
      theme,
      action: this.action(),
      callback: (token) => this.token.emit(token),
      "error-callback": (errorCode) => this.widgetError.emit(errorCode),
      "expired-callback": () => this.expired.emit(),
    });
  }

  private reRenderWidget(theme: "light" | "dark"): void {
    if (this.widgetId !== null) {
      this.turnstile.remove(this.widgetId);
      this.widgetId = null;
    }
    this.renderWidget(theme);
  }
}
