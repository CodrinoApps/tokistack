import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import type { ValidationError, WithOptionalFieldTree } from "@angular/forms/signals";
import { TokiInputComponent } from "./input";

@Component({
  selector: "test-host",
  template: `<toki-input
    [label]="label"
    [type]="type"
    [placeholder]="placeholder"
    [autocomplete]="autocomplete"
    [disabled]="disabled"
    [readonly]="readonly"
    [hidden]="hidden"
    [invalid]="invalid"
    [(touched)]="touched"
    [required]="required"
    [errors]="errors"
    [(value)]="value"
  >
    @if (showPrefix) {
      <span tokiPrefix>P</span>
    }
    @if (showSuffix) {
      <span tokiSuffix>S</span>
    }
  </toki-input>`,
  imports: [TokiInputComponent],
})
class TestHostComponent {
  label = "";
  type = "text";
  placeholder = "";
  autocomplete = "";
  disabled = false;
  readonly = false;
  hidden = false;
  invalid = false;
  touched = false;
  required = false;
  errors: readonly WithOptionalFieldTree<ValidationError>[] = [];
  value = "";
  showPrefix = false;
  showSuffix = false;
}

describe("TokiInputComponent", () => {
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
    const inputEl = host.querySelector("input") as HTMLInputElement;
    return { fixture, host, inputEl };
  }

  it("should render with label and input", () => {
    const { host, inputEl } = create({ label: "Email" });
    const label = host.querySelector(".input__label") as HTMLLabelElement;
    expect(label).not.toBeNull();
    expect(label.textContent).toContain("Email");
    expect(inputEl).not.toBeNull();
  });

  it("should link label and input via for/id", () => {
    const { host, inputEl } = create({ label: "Email" });
    const label = host.querySelector(".input__label") as HTMLLabelElement;
    expect(label.getAttribute("for")).toBe(inputEl.id);
  });

  it("should two-way bind value", async () => {
    const { fixture, inputEl } = create({ value: "hello" });
    expect(inputEl.value).toBe("hello");

    inputEl.value = "world";
    inputEl.dispatchEvent(new Event("input"));
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBe("world");
  });

  it("should pass through type attribute", () => {
    const { inputEl } = create({ type: "password" });
    expect(inputEl.type).toBe("password");
  });

  it("should pass through placeholder", () => {
    const { inputEl } = create({ placeholder: "Enter value" });
    expect(inputEl.placeholder).toBe("Enter value");
  });

  it("should pass through autocomplete", () => {
    const { inputEl } = create({ autocomplete: "email" });
    expect(inputEl.autocomplete).toBe("email");
  });

  it("should show required indicator when required", () => {
    const { host } = create({ label: "Email", required: true });
    const required = host.querySelector(".input__required");
    expect(required).not.toBeNull();
    expect(required!.textContent).toContain("*");
  });

  it("should set aria-required when required", () => {
    const { inputEl } = create({ required: true });
    expect(inputEl.getAttribute("aria-required")).toBe("true");
  });

  it("should not show required indicator by default", () => {
    const { host } = create({ label: "Email" });
    const required = host.querySelector(".input__required");
    expect(required).toBeNull();
  });

  it("should disable input when disabled", () => {
    const { inputEl } = create({ disabled: true });
    expect(inputEl.disabled).toBe(true);
  });

  it("should set readonly on input when readonly", () => {
    const { inputEl } = create({ readonly: true });
    expect(inputEl.readOnly).toBe(true);
  });

  it("should hide entirely when hidden", () => {
    const { host } = create({ hidden: true });
    const inputEl = host.querySelector("input");
    expect(inputEl).toBeNull();
  });

  it("should set touched on blur", () => {
    const { fixture, inputEl } = create();
    expect(fixture.componentInstance.touched).toBe(false);

    inputEl.dispatchEvent(new Event("blur"));
    fixture.detectChanges();
    expect(fixture.componentInstance.touched).toBe(true);
  });

  it("should not show errors when valid", () => {
    const { host } = create({
      invalid: false,
      touched: true,
      errors: [{ message: "Required" } as WithOptionalFieldTree<ValidationError>],
    });
    const errors = host.querySelector(".input__errors");
    expect(errors).toBeNull();
  });

  it("should not show errors when not touched", () => {
    const { host } = create({
      invalid: true,
      touched: false,
      errors: [{ message: "Required" } as WithOptionalFieldTree<ValidationError>],
    });
    const errors = host.querySelector(".input__errors");
    expect(errors).toBeNull();
  });

  it("should show errors when invalid, touched, and errors present", () => {
    const { host } = create({
      invalid: true,
      touched: true,
      errors: [{ message: "Required" } as WithOptionalFieldTree<ValidationError>],
    });
    const errors = host.querySelector(".input__errors");
    expect(errors).not.toBeNull();
    expect(errors!.textContent).toContain("Required");
  });

  it("should set aria-invalid when invalid and touched", () => {
    const { inputEl } = create({ invalid: true, touched: true });
    expect(inputEl.getAttribute("aria-invalid")).toBe("true");
  });

  it("should not set aria-invalid when not touched", () => {
    const { inputEl } = create({ invalid: true, touched: false });
    expect(inputEl.getAttribute("aria-invalid")).toBeNull();
  });

  it("should set aria-describedby pointing to errors container", () => {
    const { host, inputEl } = create({
      invalid: true,
      touched: true,
      errors: [{ message: "Error" } as WithOptionalFieldTree<ValidationError>],
    });
    const errorsEl = host.querySelector(".input__errors");
    expect(inputEl.getAttribute("aria-describedby")).toBe(errorsEl!.id);
  });

  it("should apply invalid class to wrapper when invalid and touched", () => {
    const { host } = create({ invalid: true, touched: true });
    const wrapper = host.querySelector(".input__wrapper");
    expect(wrapper!.classList.contains("input__wrapper--invalid")).toBe(true);
  });

  it("should apply disabled class to wrapper when disabled", () => {
    const { host } = create({ disabled: true });
    const wrapper = host.querySelector(".input__wrapper");
    expect(wrapper!.classList.contains("input__wrapper--disabled")).toBe(true);
  });

  it("should project prefix content", () => {
    const { host } = create({ showPrefix: true });
    const prefix = host.querySelector(".input__prefix");
    expect(prefix).not.toBeNull();
    expect(prefix!.textContent).toContain("P");
  });

  it("should project suffix content", () => {
    const { host } = create({ showSuffix: true });
    const suffix = host.querySelector(".input__suffix");
    expect(suffix).not.toBeNull();
    expect(suffix!.textContent).toContain("S");
  });
});
