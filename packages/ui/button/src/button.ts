import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
} from "@angular/core";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "neutral"
  | "success"
  | "ghost"
  | "error"
  | "warning"
  | "info";
export type ButtonSize = "sm" | "md" | "lg";

@Component({
  selector: "button[toki-button], a[toki-button]",
  host: {
    class: "btn",
    "[class.btn--primary]": "variant() === 'primary'",
    "[class.btn--secondary]": "variant() === 'secondary'",
    "[class.btn--accent]": "variant() === 'accent'",
    "[class.btn--neutral]": "variant() === 'neutral'",
    "[class.btn--success]": "variant() === 'success'",
    "[class.btn--ghost]": "variant() === 'ghost'",
    "[class.btn--error]": "variant() === 'error'",
    "[class.btn--warning]": "variant() === 'warning'",
    "[class.btn--info]": "variant() === 'info'",
    "[class.btn--sm]": "size() === 'sm'",
    "[class.btn--md]": "size() === 'md'",
    "[class.btn--lg]": "size() === 'lg'",
    "[class.btn--soft]": "soft()",
    "[class.btn--outline]": "outline()",
    "[class.btn--icon-only]": "iconOnly()",
    "[class.btn--disabled]": "disabled() || loading()",
    "[class.btn--loading]": "loading()",
    "[attr.disabled]": "_disabledAttr()",
    "[attr.type]": "_typeAttr()",
    "[attr.aria-disabled]": "disabled() || loading() || null",
    "[attr.aria-busy]": "loading() || null",
    "[attr.tabindex]": "(disabled() || loading()) ? -1 : null",
    "[style.pointer-events]": "(disabled() || loading()) ? 'none' : null",
  },
  template: `
    <span class="btn__content"><ng-content /></span>
    @if (loading()) {
      <span class="btn__spinner" aria-hidden="true"></span>
    }
  `,
  styleUrl: "./button.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  private readonly _isButton = inject(ElementRef).nativeElement.tagName === "BUTTON";

  /** @see {@link ButtonVariant} for allowed values */
  readonly variant = input<ButtonVariant>("primary");

  /** @see {@link ButtonSize} for allowed values */
  readonly size = input<ButtonSize>("md");
  readonly soft = input(false, { transform: booleanAttribute });
  readonly outline = input(false, { transform: booleanAttribute });
  readonly iconOnly = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly type = input<"button" | "submit" | "reset">("button");

  /** Only set `disabled` attr on native `<button>` elements — anchors don't support it. */
  protected readonly _disabledAttr = computed(() =>
    this._isButton && (this.disabled() || this.loading()) ? true : null
  );

  /** Bind the type attribute only on native `<button>` elements — anchors don't support it. */
  protected readonly _typeAttr = computed(() => this._isButton ? this.type() : null);
}
