import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import type { ValidationError, WithOptionalFieldTree } from "@angular/forms/signals";
import { type SelectOption, TokiSelectComponent } from "./select";

const TEST_OPTIONS: SelectOption[] = [
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch" },
  { value: "fr", label: "Francais" },
];

const OPTIONS_WITH_DISABLED: SelectOption[] = [
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch", disabled: true },
  { value: "fr", label: "Francais" },
];

@Component({
  selector: "test-host",
  template: `<toki-select
    [label]="label"
    [placeholder]="placeholder"
    [options]="options"
    [disabled]="disabled"
    [readonly]="readonly"
    [hidden]="hidden"
    [invalid]="invalid"
    [(touched)]="touched"
    [required]="required"
    [errors]="errors"
    [(value)]="value"
  />`,
  imports: [TokiSelectComponent],
})
class TestHostComponent {
  label = "";
  placeholder = "";
  options: readonly SelectOption[] = TEST_OPTIONS;
  disabled = false;
  readonly = false;
  hidden = false;
  invalid = false;
  touched = false;
  required = false;
  errors: readonly WithOptionalFieldTree<ValidationError>[] = [];
  value = "";
}

describe("TokiSelectComponent", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });
  });

  function create(overrides: Partial<TestHostComponent> = {}) {
    const fixture = TestBed.createComponent(TestHostComponent);
    Object.assign(fixture.componentInstance, overrides);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const triggerEl = host.querySelector(".select__trigger") as HTMLElement;
    const inputEl = host.querySelector(".select__input") as HTMLInputElement;
    return { fixture, host, triggerEl, inputEl };
  }

  /** Focus the input and open the panel via click (simulates real user interaction). */
  async function openPanel(fixture: ReturnType<typeof create>["fixture"], inputEl: HTMLInputElement) {
    inputEl.focus();
    inputEl.dispatchEvent(new Event("focusin", { bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();

    inputEl.click();
    fixture.detectChanges();
    await fixture.whenStable();
  }

  it("should render with label", () => {
    const { host } = create({ label: "Language" });
    const label = host.querySelector(".select__label") as HTMLLabelElement;
    expect(label).not.toBeNull();
    expect(label.textContent).toContain("Language");
  });

  it("should link label and input via for/id", () => {
    const { host, inputEl } = create({ label: "Language" });
    const label = host.querySelector(".select__label") as HTMLLabelElement;
    expect(label.getAttribute("for")).toBe(inputEl.id);
  });

  it("should display placeholder when no value", () => {
    const { triggerEl } = create({ placeholder: "Select language" });
    expect(triggerEl.textContent).toContain("Select language");
  });

  it("should display selected option label when value is set", () => {
    const { triggerEl } = create({ value: "de" });
    expect(triggerEl.textContent).toContain("Deutsch");
  });

  it("should show required indicator when required", () => {
    const { host } = create({ label: "Language", required: true });
    const required = host.querySelector(".select__required");
    expect(required).not.toBeNull();
    expect(required!.textContent).toContain("*");
  });

  it("should not show required indicator by default", () => {
    const { host } = create({ label: "Language" });
    const required = host.querySelector(".select__required");
    expect(required).toBeNull();
  });

  it("should open panel on click", async () => {
    const { host, inputEl, fixture } = create();
    expect(host.querySelector(".select__panel")).toBeNull();

    await openPanel(fixture, inputEl);
    expect(host.querySelector(".select__panel")).not.toBeNull();
  });

  it("should close panel on second click", async () => {
    const { host, inputEl, fixture } = create();
    await openPanel(fixture, inputEl);
    const panel = host.querySelector(".select__panel")!;
    expect(panel.classList.contains("select__panel--closed")).toBe(false);

    inputEl.click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(panel.classList.contains("select__panel--closed")).toBe(true);
  });

  it("should render options in the panel", async () => {
    const { host, inputEl, fixture } = create();
    await openPanel(fixture, inputEl);

    const options = host.querySelectorAll(".select__option");
    expect(options.length).toBe(3);
    expect(options[0]!.textContent).toContain("English");
    expect(options[1]!.textContent).toContain("Deutsch");
    expect(options[2]!.textContent).toContain("Francais");
  });

  it("should select option on click and close panel", async () => {
    const { host, inputEl, fixture } = create();
    await openPanel(fixture, inputEl);

    const option = host.querySelectorAll(".select__option")[1] as HTMLElement;
    option.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    option.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.componentInstance.value).toBe("de");
    const panel = host.querySelector(".select__panel")!;
    expect(panel.classList.contains("select__panel--closed")).toBe(true);
  });

  it("should not open when disabled", async () => {
    const { host, inputEl, fixture } = create({ disabled: true });
    inputEl.focus();
    inputEl.dispatchEvent(new Event("focusin", { bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();

    inputEl.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const panel = host.querySelector(".select__panel")!;
    expect(panel.classList.contains("select__panel--closed")).toBe(true);
  });

  it("should hide entirely when hidden", () => {
    const { host } = create({ hidden: true });
    const triggerEl = host.querySelector(".select__trigger");
    expect(triggerEl).toBeNull();
  });

  it("should set role=combobox on input", () => {
    const { inputEl } = create();
    expect(inputEl.getAttribute("role")).toBe("combobox");
  });

  it("should set aria-expanded on input", async () => {
    const { inputEl, fixture } = create();
    expect(inputEl.getAttribute("aria-expanded")).toBe("false");

    await openPanel(fixture, inputEl);
    expect(inputEl.getAttribute("aria-expanded")).toBe("true");
  });

  it("should have role=listbox on panel", async () => {
    const { host, inputEl, fixture } = create();
    await openPanel(fixture, inputEl);

    const panel = host.querySelector(".select__panel");
    expect(panel!.getAttribute("role")).toBe("listbox");
  });

  it("should have role=option on options", async () => {
    const { host, inputEl, fixture } = create();
    await openPanel(fixture, inputEl);

    const options = host.querySelectorAll(".select__option");
    options.forEach((option) => {
      expect(option.getAttribute("role")).toBe("option");
    });
  });

  it("should set aria-invalid when invalid and touched", () => {
    const { inputEl } = create({ invalid: true, touched: true });
    expect(inputEl.getAttribute("aria-invalid")).toBe("true");
  });

  it("should not set aria-invalid when not touched", () => {
    const { inputEl } = create({ invalid: true, touched: false });
    expect(inputEl.getAttribute("aria-invalid")).toBeNull();
  });

  it("should set aria-required when required", () => {
    const { inputEl } = create({ required: true });
    expect(inputEl.getAttribute("aria-required")).toBe("true");
  });

  it("should not show errors when valid", () => {
    const { host } = create({
      invalid: false,
      touched: true,
      errors: [{ message: "Required" } as WithOptionalFieldTree<ValidationError>],
    });
    const errors = host.querySelector(".select__errors");
    expect(errors).toBeNull();
  });

  it("should not show errors when not touched", () => {
    const { host } = create({
      invalid: true,
      touched: false,
      errors: [{ message: "Required" } as WithOptionalFieldTree<ValidationError>],
    });
    const errors = host.querySelector(".select__errors");
    expect(errors).toBeNull();
  });

  it("should show errors when invalid, touched, and errors present", () => {
    const { host } = create({
      invalid: true,
      touched: true,
      errors: [{ message: "Required" } as WithOptionalFieldTree<ValidationError>],
    });
    const errors = host.querySelector(".select__errors");
    expect(errors).not.toBeNull();
    expect(errors!.textContent).toContain("Required");
  });

  it("should set aria-describedby pointing to errors container", () => {
    const { host, inputEl } = create({
      invalid: true,
      touched: true,
      errors: [{ message: "Error" } as WithOptionalFieldTree<ValidationError>],
    });
    const errorsEl = host.querySelector(".select__errors");
    expect(inputEl.getAttribute("aria-describedby")).toBe(errorsEl!.id);
  });

  it("should apply invalid class to trigger when invalid and touched", () => {
    const { triggerEl } = create({ invalid: true, touched: true });
    expect(triggerEl.classList.contains("select__trigger--invalid")).toBe(true);
  });

  it("should apply disabled class to trigger when disabled", () => {
    const { triggerEl } = create({ disabled: true });
    expect(triggerEl.classList.contains("select__trigger--disabled")).toBe(true);
  });

  it("should apply placeholder class to trigger when no value", () => {
    const { triggerEl } = create({ placeholder: "Choose" });
    expect(triggerEl.classList.contains("select__trigger--placeholder")).toBe(true);
  });

  it("should open on ArrowDown key", async () => {
    const { host, inputEl, fixture } = create();
    inputEl.focus();
    inputEl.dispatchEvent(new Event("focusin", { bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();

    inputEl.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(host.querySelector(".select__panel")).not.toBeNull();
  });

  it("should open on ArrowUp key", async () => {
    const { host, inputEl, fixture } = create();
    inputEl.focus();
    inputEl.dispatchEvent(new Event("focusin", { bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();

    inputEl.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(host.querySelector(".select__panel")).not.toBeNull();
  });

  it("should open on Enter key", async () => {
    const { host, inputEl, fixture } = create();
    inputEl.focus();
    inputEl.dispatchEvent(new Event("focusin", { bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();

    inputEl.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(host.querySelector(".select__panel")).not.toBeNull();
  });

  it("should open on Space key", async () => {
    const { host, inputEl, fixture } = create();
    inputEl.focus();
    inputEl.dispatchEvent(new Event("focusin", { bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();

    inputEl.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(host.querySelector(".select__panel")).not.toBeNull();
  });

  it("should set aria-controls when open", async () => {
    const { host, inputEl, fixture } = create();
    await openPanel(fixture, inputEl);

    const panel = host.querySelector(".select__panel");
    expect(inputEl.getAttribute("aria-controls")).toBe(panel!.id);
  });

  it("should render disabled options with aria-disabled", async () => {
    const { host, inputEl, fixture } = create({ options: OPTIONS_WITH_DISABLED });
    await openPanel(fixture, inputEl);

    const options = host.querySelectorAll(".select__option");
    expect(options[1]!.getAttribute("aria-disabled")).toBe("true");
  });
});
