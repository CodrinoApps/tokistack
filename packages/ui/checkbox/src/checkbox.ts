import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  model,
  viewChild,
} from "@angular/core";
import type { FormValueControl, ValidationError, WithOptionalFieldTree } from "@angular/forms/signals";
import { TRANSLATE_FN } from "@tokistack/ui/i18n";

let nextId = 0;

@Component({
  selector: "toki-checkbox",
  host: {
    class: "checkbox",
    "[class.checkbox--disabled]": "disabled()",
    "[class.checkbox--invalid]": "showInvalid()",
    "[class.checkbox--checked]": "value()",
    "[class.checkbox--indeterminate]": "indeterminate()",
  },
  template: `
    <label class="checkbox__label-wrapper" [attr.for]="id">
      <input
        #inputRef
        class="checkbox__native"
        type="checkbox"
        [id]="id"
        [name]="name()"
        [checked]="value()"
        [disabled]="disabled()"
        [attr.aria-required]="required() || null"
        [attr.aria-invalid]="showInvalid() || null"
        [attr.aria-labelledby]="ariaLabelledBy() || null"
        [attr.aria-describedby]="showErrors() ? errorsId : null"
        [attr.aria-disabled]="disabled() || null"
        (change)="onToggle($event)"
        (blur)="onBlur()"
      />
      <span class="checkbox__box" aria-hidden="true">
        <svg
          class="checkbox__check"
          viewBox="0 0 12 10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M1.5 5L4.5 8L10.5 1.5"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span class="checkbox__dash" aria-hidden="true"></span>
      </span>
      @if (label()) {
        <span class="checkbox__text">
          {{ label() }}
          @if (required()) {
            <span class="checkbox__required" aria-hidden="true">*</span>
          }
        </span>
      }
    </label>
    @if (showErrors()) {
      <div class="checkbox__errors" [id]="errorsId" role="alert" aria-live="polite">
        @for (error of errors(); track $index) {
          @if (error.message) {
            <span class="checkbox__error">{{ translate(error.message) }}</span>
          }
        }
      </div>
    }
  `,
  styleUrl: "./checkbox.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TokiCheckboxComponent implements FormValueControl<boolean> {
  readonly value = model<boolean>(false);
  readonly touched = model<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly invalid = input<boolean>(false);
  readonly errors = input<readonly WithOptionalFieldTree<ValidationError>[]>([]);
  readonly required = input<boolean>(false);
  readonly name = input<string>("");
  readonly label = input<string>("");
  readonly indeterminate = input<boolean>(false);
  readonly ariaLabelledBy = input<string>("");

  readonly showInvalid = computed(() => this.invalid() && this.touched());
  readonly showErrors = computed(() => this.showInvalid() && this.errors().length > 0);

  protected readonly translate = inject(TRANSLATE_FN);
  protected readonly id = `toki-checkbox-${nextId++}`;
  protected readonly errorsId = `${this.id}-errors`;

  // `indeterminate` is a DOM property only — cannot be set via an HTML attribute.
  private readonly inputRef = viewChild.required<ElementRef<HTMLInputElement>>("inputRef");
  private readonly _indeterminateEffect = effect(() => {
    this.inputRef().nativeElement.indeterminate = this.indeterminate();
  });

  /**
   * Updates the HTML input element
   * @param event
   * @returns
   */
  protected onToggle(event: Event): void {
    if (this.disabled()) return;
    this.value.set((event.target as HTMLInputElement).checked);
    this.touched.set(true);
  }

  /**
   * Updates the touched set on blur
   */
  protected onBlur(): void {
    this.touched.set(true);
  }
}
