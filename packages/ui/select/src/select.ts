import { Combobox, ComboboxInput, ComboboxPopupContainer } from "@angular/aria/combobox";
import { Listbox, Option } from "@angular/aria/listbox";
import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  linkedSignal,
  model,
  signal,
  viewChild,
} from "@angular/core";
import type { FormValueControl, ValidationError, WithOptionalFieldTree } from "@angular/forms/signals";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

let nextId = 0;

@Component({
  selector: "toki-select",
  host: {
    class: "select",
    "[class.select--disabled]": "disabled()",
    "[class.select--hidden]": "hidden()",
  },
  imports: [Listbox, Option, Combobox, ComboboxInput, ComboboxPopupContainer],
  template: `
    @if (!hidden()) {
      @if (label()) {
        <label class="select__label" [attr.for]="inputId">
          {{ label() }}
          @if (required()) {
            <span class="select__required" aria-hidden="true">*</span>
          }
        </label>
      }

      <div
        class="select__container"
        ngCombobox
        #combobox="ngCombobox"
        readonly
        [disabled]="disabled()"
        (focusout)="onFocusOut($event)"
      >
        <div
          class="select__trigger"
          [class.select__trigger--icon]="iconOnly()"
          [class.select__trigger--invalid]="showInvalid()"
          [class.select__trigger--disabled]="disabled()"
          [class.select__trigger--open]="combobox.expanded()"
          [class.select__trigger--placeholder]="!selectedOption()"
        >
          <ng-content select="[tokiSelectIcon]" />
          @if (!iconOnly()) {
            <span class="select__value">{{ displayText() }}</span>
            <svg
              class="select__arrow"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                clip-rule="evenodd"
              />
            </svg>
          }
          <input
            ngComboboxInput
            #comboboxInput="ngComboboxInput"
            class="select__input"
            [id]="inputId"
            readonly
            [attr.aria-label]="iconOnly() ? (displayText() || placeholder()) : null"
            [attr.aria-invalid]="showInvalid() || null"
            [attr.aria-required]="required() || null"
            [attr.aria-describedby]="showErrors() ? errorsId : null"
          />
        </div>

        <ng-template ngComboboxPopupContainer>
          <ul
            ngListbox
            class="select__panel"
            [values]="listboxValues()"
            (valuesChange)="onSelection($event)"
            [class.select__panel--above]="openAbove()"
            [class.select__panel--closed]="!combobox.expanded()"
          >
            @for (option of options(); track option.value) {
              <li
                ngOption
                class="select__option"
                [value]="option.value"
                [label]="option.label"
                [disabled]="option.disabled ?? false"
              >
                {{ option.label }}
              </li>
            }
          </ul>
        </ng-template>
      </div>

      @if (showErrors()) {
        <div class="select__errors" [id]="errorsId" role="alert" aria-live="polite">
          @for (error of errors(); track $index) {
            <span class="select__error">{{ error.message }}</span>
          }
        </div>
      }
    }
  `,
  styleUrl: "./select.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TokiSelectComponent implements FormValueControl<string> {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly comboboxRef = viewChild<Combobox<string>>("combobox");

  readonly value = model<string>("");
  readonly touched = model<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly hidden = input<boolean>(false);
  readonly invalid = input<boolean>(false);
  readonly errors = input<readonly WithOptionalFieldTree<ValidationError>[]>([]);
  readonly required = input<boolean>(false);
  readonly name = input<string>("");
  readonly label = input<string>("");
  readonly placeholder = input<string>("");
  readonly options = input.required<readonly SelectOption[]>();
  readonly iconOnly = input<boolean>(false);
  readonly openAbove = signal(false);
  readonly listboxValues = linkedSignal(() => {
    const val = this.value();
    return val ? [val] : [];
  });
  readonly expanded = computed(() => this.comboboxRef()?.expanded() ?? false);
  readonly selectedOption = computed(() => {
    const val = this.value();
    return this.options().find((o) => o.value === val) ?? null;
  });
  readonly displayText = computed(() => this.selectedOption()?.label ?? this.placeholder());
  readonly showInvalid = computed(() => this.invalid() && this.touched());
  readonly showErrors = computed(() => this.showInvalid() && this.errors().length > 0);

  protected readonly inputId = `toki-select-${nextId++}`;
  protected readonly errorsId = `${this.inputId}-errors`;

  private readonly _positionEffect = afterRenderEffect(() => {
    const expanded = this.expanded();
    const rect = this.elementRef.nativeElement.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const panelMaxHeight = 240;
    this.openAbove.set(expanded && spaceBelow < panelMaxHeight && rect.top > panelMaxHeight);
  });

  onSelection(values: string[]): void {
    const newValue = values[0];
    if (newValue === undefined || newValue === this.value()) return;

    this.value.set(newValue);
    this.comboboxRef()?.close();
  }

  onFocusOut(event: FocusEvent): void {
    const relatedTarget = event.relatedTarget;
    if (relatedTarget instanceof HTMLElement && this.elementRef.nativeElement.contains(relatedTarget)) {
      return;
    }
    this.touched.set(true);
  }
}
