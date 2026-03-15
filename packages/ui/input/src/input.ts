import { ChangeDetectionStrategy, Component, computed, input, model } from "@angular/core";
import type { FormValueControl, ValidationError, WithOptionalFieldTree } from "@angular/forms/signals";

let nextId = 0;

@Component({
  selector: "toki-input",
  host: {
    class: "input",
    "[class.input--disabled]": "disabled()",
    "[class.input--hidden]": "hidden()",
  },
  template: `
    @if (!hidden()) {
      @if (label()) {
        <label class="input__label" [attr.for]="id">
          {{ label() }}
          @if (required()) {
            <span class="input__required" aria-hidden="true">*</span>
          }
        </label>
      }
      <div
        class="input__wrapper"
        [class.input__wrapper--invalid]="invalid() && touched()"
        [class.input__wrapper--disabled]="disabled()"
      >
        <span class="input__prefix">
          <ng-content select="[tokiPrefix]" />
        </span>
        <input
          class="input__native"
          [id]="id"
          [type]="type()"
          [name]="name()"
          [placeholder]="placeholder()"
          [autocomplete]="autocomplete()"
          [disabled]="disabled()"
          [readonly]="readonly()"
          [value]="value()"
          [attr.aria-invalid]="invalid() && touched() || null"
          [attr.aria-required]="required() || null"
          [attr.aria-describedby]="showErrors() ? errorsId : null"
          (input)="value.set($any($event.target).value)"
          (blur)="touched.set(true)"
        />
        <span class="input__suffix">
          <ng-content select="[tokiSuffix]" />
        </span>
      </div>
      @if (showErrors()) {
        <div class="input__errors" [id]="errorsId" role="alert" aria-live="polite">
          @for (error of errors(); track $index) {
            <span class="input__error">{{ error.message }}</span>
          }
        </div>
      }
    }
  `,
  styleUrl: "./input.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TokiInputComponent implements FormValueControl<string> {
  // FormValueControl signals
  readonly value = model<string>("");
  readonly touched = model<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly hidden = input<boolean>(false);
  readonly invalid = input<boolean>(false);
  readonly errors = input<readonly WithOptionalFieldTree<ValidationError>[]>([]);
  readonly required = input<boolean>(false);
  readonly name = input<string>("");

  // Component-specific inputs
  readonly label = input<string>("");
  readonly type = input<string>("text");
  readonly placeholder = input<string>("");
  readonly autocomplete = input<string>("");

  // Computed
  readonly showErrors = computed(() => this.invalid() && this.touched() && this.errors().length > 0);

  // Auto-generated IDs
  protected readonly id = `toki-input-${nextId++}`;
  protected readonly errorsId = `${this.id}-errors`;
}
