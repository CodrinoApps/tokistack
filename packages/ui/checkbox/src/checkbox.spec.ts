import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import type { ValidationError, WithOptionalFieldTree } from "@angular/forms/signals";
import { TokiCheckboxComponent } from "./checkbox";

@Component({
  selector: "test-host",
  template: `<toki-checkbox
    [label]="label"
    [name]="name"
    [disabled]="disabled"
    [invalid]="invalid"
    [(touched)]="touched"
    [required]="required"
    [errors]="errors"
    [indeterminate]="indeterminate"
    [(value)]="value"
  />`,
  imports: [TokiCheckboxComponent],
})
class TestHostComponent {
  label = "";
  name = "";
  disabled = false;
  invalid = false;
  touched = false;
  required = false;
  indeterminate = false;
  errors: readonly WithOptionalFieldTree<ValidationError>[] = [];
  value = false;
}

describe("TokiCheckboxComponent", () => {
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
    const inputEl = host.querySelector("input[type='checkbox']") as HTMLInputElement;
    return { fixture, host, inputEl };
  }

  // ─── Rendering ─────────────────────────────────────────────────────────────

  it("should render a native checkbox input", () => {
    const { inputEl } = create();
    expect(inputEl).not.toBeNull();
    expect(inputEl.type).toBe("checkbox");
  });

  it("should render the visual checkbox box", () => {
    const { host } = create();
    expect(host.querySelector(".checkbox__box")).not.toBeNull();
  });

  // ─── Label ─────────────────────────────────────────────────────────────────

  it("should render label text when label is set", () => {
    const { host } = create({ label: "I agree to the terms" });
    const text = host.querySelector(".checkbox__text");
    expect(text).not.toBeNull();
    expect(text!.textContent).toContain("I agree to the terms");
  });

  it("should not render label text when label is empty", () => {
    const { host } = create({ label: "" });
    expect(host.querySelector(".checkbox__text")).toBeNull();
  });

  it("should associate label and input via for/id", () => {
    const { host, inputEl } = create({ label: "Accept" });
    const label = host.querySelector(".checkbox__label-wrapper") as HTMLLabelElement;
    expect(label.getAttribute("for")).toBe(inputEl.id);
  });

  // ─── Required ──────────────────────────────────────────────────────────────

  it("should show required indicator when required and label is set", () => {
    const { host } = create({ label: "Accept", required: true });
    const required = host.querySelector(".checkbox__required");
    expect(required).not.toBeNull();
    expect(required!.textContent).toContain("*");
  });

  it("should not show required indicator when not required", () => {
    const { host } = create({ label: "Accept", required: false });
    expect(host.querySelector(".checkbox__required")).toBeNull();
  });

  it("should set aria-required when required", () => {
    const { inputEl } = create({ required: true });
    expect(inputEl.getAttribute("aria-required")).toBe("true");
  });

  it("should not set aria-required when not required", () => {
    const { inputEl } = create({ required: false });
    expect(inputEl.getAttribute("aria-required")).toBeNull();
  });

  // ─── Two-way value binding ──────────────────────────────────────────────────

  it("should reflect value=true as checked", () => {
    const { inputEl } = create({ value: true });
    expect(inputEl.checked).toBe(true);
  });

  it("should reflect value=false as unchecked", () => {
    const { inputEl } = create({ value: false });
    expect(inputEl.checked).toBe(false);
  });

  it("should update value when user checks the box", () => {
    const { fixture, inputEl } = create({ value: false });
    inputEl.checked = true;
    inputEl.dispatchEvent(new Event("change"));
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBe(true);
  });

  it("should update value when user unchecks the box", () => {
    const { fixture, inputEl } = create({ value: true });
    inputEl.checked = false;
    inputEl.dispatchEvent(new Event("change"));
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBe(false);
  });

  // ─── Disabled ──────────────────────────────────────────────────────────────

  it("should disable the native input when disabled", () => {
    const { inputEl } = create({ disabled: true });
    expect(inputEl.disabled).toBe(true);
  });

  it("should add host class checkbox--disabled when disabled", () => {
    const { host } = create({ disabled: true });
    const checkboxHost = host.querySelector("toki-checkbox");
    expect(checkboxHost!.classList.contains("checkbox--disabled")).toBe(true);
  });

  it("should set aria-disabled when disabled", () => {
    const { inputEl } = create({ disabled: true });
    expect(inputEl.getAttribute("aria-disabled")).toBe("true");
  });

  it("should not change value when disabled and change event fires", () => {
    const { fixture, inputEl } = create({ value: false, disabled: true });
    inputEl.checked = true;
    inputEl.dispatchEvent(new Event("change"));
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBe(false);
  });

  // ─── Touched ───────────────────────────────────────────────────────────────

  it("should start with touched=false", () => {
    const { fixture } = create();
    expect(fixture.componentInstance.touched).toBe(false);
  });

  it("should set touched=true on blur", () => {
    const { fixture, inputEl } = create();
    inputEl.dispatchEvent(new Event("blur"));
    fixture.detectChanges();
    expect(fixture.componentInstance.touched).toBe(true);
  });

  it("should set touched=true on change", () => {
    const { fixture, inputEl } = create();
    inputEl.checked = true;
    inputEl.dispatchEvent(new Event("change"));
    fixture.detectChanges();
    expect(fixture.componentInstance.touched).toBe(true);
  });

  // ─── Error display ─────────────────────────────────────────────────────────

  it("should not show errors when invalid=false even with touched and errors", () => {
    const { host } = create({
      invalid: false,
      touched: true,
      errors: [{ message: "Required" } as WithOptionalFieldTree<ValidationError>],
    });
    expect(host.querySelector(".checkbox__errors")).toBeNull();
  });

  it("should not show errors when touched=false even with invalid and errors", () => {
    const { host } = create({
      invalid: true,
      touched: false,
      errors: [{ message: "Required" } as WithOptionalFieldTree<ValidationError>],
    });
    expect(host.querySelector(".checkbox__errors")).toBeNull();
  });

  it("should show errors when invalid, touched, and errors are present", () => {
    const { host } = create({
      invalid: true,
      touched: true,
      errors: [{ message: "You must accept" } as WithOptionalFieldTree<ValidationError>],
    });
    const errors = host.querySelector(".checkbox__errors");
    expect(errors).not.toBeNull();
    expect(errors!.textContent).toContain("You must accept");
  });

  it("should render multiple error messages", () => {
    const { host } = create({
      invalid: true,
      touched: true,
      errors: [
        { message: "Error one" } as WithOptionalFieldTree<ValidationError>,
        { message: "Error two" } as WithOptionalFieldTree<ValidationError>,
      ],
    });
    const errorEls = host.querySelectorAll(".checkbox__error");
    expect(errorEls.length).toBe(2);
  });

  // ─── ARIA states ───────────────────────────────────────────────────────────

  it("should set aria-invalid when invalid and touched", () => {
    const { inputEl } = create({ invalid: true, touched: true });
    expect(inputEl.getAttribute("aria-invalid")).toBe("true");
  });

  it("should not set aria-invalid when not touched", () => {
    const { inputEl } = create({ invalid: true, touched: false });
    expect(inputEl.getAttribute("aria-invalid")).toBeNull();
  });

  it("should set aria-describedby pointing to errors container when errors shown", () => {
    const { host, inputEl } = create({
      invalid: true,
      touched: true,
      errors: [{ message: "Error" } as WithOptionalFieldTree<ValidationError>],
    });
    const errorsEl = host.querySelector(".checkbox__errors");
    expect(inputEl.getAttribute("aria-describedby")).toBe(errorsEl!.id);
  });

  it("should not set aria-describedby when errors are not shown", () => {
    const { inputEl } = create({ invalid: false, touched: true });
    expect(inputEl.getAttribute("aria-describedby")).toBeNull();
  });

  // ─── Host classes ──────────────────────────────────────────────────────────

  it("should add checkbox--checked host class when value=true", () => {
    const { host } = create({ value: true });
    const checkboxHost = host.querySelector("toki-checkbox");
    expect(checkboxHost!.classList.contains("checkbox--checked")).toBe(true);
  });

  it("should not have checkbox--checked host class when value=false", () => {
    const { host } = create({ value: false });
    const checkboxHost = host.querySelector("toki-checkbox");
    expect(checkboxHost!.classList.contains("checkbox--checked")).toBe(false);
  });

  it("should add checkbox--invalid host class when invalid and touched", () => {
    const { host } = create({ invalid: true, touched: true });
    const checkboxHost = host.querySelector("toki-checkbox");
    expect(checkboxHost!.classList.contains("checkbox--invalid")).toBe(true);
  });

  it("should not have checkbox--invalid host class when not touched", () => {
    const { host } = create({ invalid: true, touched: false });
    const checkboxHost = host.querySelector("toki-checkbox");
    expect(checkboxHost!.classList.contains("checkbox--invalid")).toBe(false);
  });

  // ─── Indeterminate ─────────────────────────────────────────────────────────

  it("should add checkbox--indeterminate host class when indeterminate=true", () => {
    const { host } = create({ indeterminate: true });
    const checkboxHost = host.querySelector("toki-checkbox");
    expect(checkboxHost!.classList.contains("checkbox--indeterminate")).toBe(true);
  });

  it("should not have checkbox--indeterminate host class when indeterminate=false", () => {
    const { host } = create({ indeterminate: false });
    const checkboxHost = host.querySelector("toki-checkbox");
    expect(checkboxHost!.classList.contains("checkbox--indeterminate")).toBe(false);
  });

  it("should set the indeterminate DOM property on the native input", () => {
    const { inputEl } = create({ indeterminate: true });
    expect(inputEl.indeterminate).toBe(true);
  });

  it("should unset the indeterminate DOM property when indeterminate=false", () => {
    const { inputEl } = create({ indeterminate: false });
    expect(inputEl.indeterminate).toBe(false);
  });
});
