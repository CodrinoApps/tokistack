import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { ButtonComponent, type ButtonSize, type ButtonVariant } from "./button";

@Component({
  selector: "test-host",
  template: `<button toki-button
    [variant]="variant"
    [size]="size"
    [soft]="soft"
    [outline]="outline"
    [iconOnly]="iconOnly"
    [disabled]="disabled"
    [loading]="loading"
    class="custom-class"
  >Click</button>`,
  imports: [ButtonComponent],
})
class TestHostButtonComponent {
  variant: ButtonVariant = "primary";
  size: ButtonSize = "md";
  soft = false;
  outline = false;
  iconOnly = false;
  disabled = false;
  loading = false;
}

@Component({
  selector: "test-host-anchor",
  template: `<a toki-button [disabled]="disabled">Link</a>`,
  imports: [ButtonComponent],
})
class TestHostAnchorComponent {
  disabled = false;
}

describe("ButtonComponent", () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostButtonComponent, TestHostAnchorComponent],
    });
  });

  function createButton(overrides: Partial<TestHostButtonComponent> = {}) {
    const fixture = TestBed.createComponent(TestHostButtonComponent);
    Object.assign(fixture.componentInstance, overrides);
    fixture.detectChanges();
    const buttonEl = fixture.nativeElement.querySelector("button") as HTMLButtonElement;
    return { fixture, buttonEl };
  }

  function createAnchor(overrides: Partial<TestHostAnchorComponent> = {}) {
    const fixture = TestBed.createComponent(TestHostAnchorComponent);
    Object.assign(fixture.componentInstance, overrides);
    fixture.detectChanges();
    const anchorEl = fixture.nativeElement.querySelector("a") as HTMLAnchorElement;
    return { fixture, anchorEl };
  }

  it("should render with default variant (primary) and size (md) classes", () => {
    const { buttonEl } = createButton();
    expect(buttonEl.classList.contains("btn")).toBe(true);
    expect(buttonEl.classList.contains("btn--primary")).toBe(true);
    expect(buttonEl.classList.contains("btn--md")).toBe(true);
  });

  describe("variants", () => {
    const variants: ButtonVariant[] = [
      "primary",
      "secondary",
      "accent",
      "neutral",
      "success",
      "ghost",
      "error",
      "warning",
      "info",
    ];

    for (const variant of variants) {
      it(`should apply btn--${variant} class for variant="${variant}"`, () => {
        const { buttonEl } = createButton({ variant });
        expect(buttonEl.classList.contains(`btn--${variant}`)).toBe(true);
      });
    }
  });

  describe("sizes", () => {
    const sizes: ButtonSize[] = ["sm", "md", "lg"];

    for (const size of sizes) {
      it(`should apply btn--${size} class for size="${size}"`, () => {
        const { buttonEl } = createButton({ size });
        expect(buttonEl.classList.contains(`btn--${size}`)).toBe(true);
      });
    }
  });

  it("should apply btn--soft class when soft input is set", () => {
    const { buttonEl } = createButton({ soft: true });
    expect(buttonEl.classList.contains("btn--soft")).toBe(true);
  });

  it("should apply btn--outline class when outline input is set", () => {
    const { buttonEl } = createButton({ outline: true });
    expect(buttonEl.classList.contains("btn--outline")).toBe(true);
  });

  it("should apply btn--icon-only class when iconOnly input is set", () => {
    const { buttonEl } = createButton({ iconOnly: true });
    expect(buttonEl.classList.contains("btn--icon-only")).toBe(true);
  });

  describe("disabled state", () => {
    it("should set btn--disabled class, aria-disabled, and pointer-events none", () => {
      const { buttonEl } = createButton({ disabled: true });
      expect(buttonEl.classList.contains("btn--disabled")).toBe(true);
      expect(buttonEl.getAttribute("aria-disabled")).toBe("true");
      expect(buttonEl.style.pointerEvents).toBe("none");
    });

    it("should set native disabled attribute and type=button on <button>", () => {
      const { buttonEl } = createButton({ disabled: true });
      expect(buttonEl.disabled).toBe(true);
      expect(buttonEl.getAttribute("type")).toBe("button");
    });

    it("should NOT set native disabled attribute on <a>, but set tabindex=-1", () => {
      const { anchorEl } = createAnchor({ disabled: true });
      expect(anchorEl.hasAttribute("disabled")).toBe(false);
      expect(anchorEl.getAttribute("tabindex")).toBe("-1");
    });
  });

  describe("loading state", () => {
    it("should set btn--loading class and aria-busy", () => {
      const { buttonEl } = createButton({ loading: true });
      expect(buttonEl.classList.contains("btn--loading")).toBe(true);
      expect(buttonEl.getAttribute("aria-busy")).toBe("true");
    });

    it("should render spinner element", () => {
      const { buttonEl } = createButton({ loading: true });
      const spinner = buttonEl.querySelector(".btn__spinner");
      expect(spinner).not.toBeNull();
    });

    it("should hide content via btn__content visibility", () => {
      const { buttonEl } = createButton({ loading: true });
      const content = buttonEl.querySelector(".btn__content") as HTMLElement;
      expect(content).not.toBeNull();
      expect(buttonEl.classList.contains("btn--loading")).toBe(true);
    });
  });

  it("should preserve consumer classes", () => {
    const { buttonEl } = createButton();
    expect(buttonEl.classList.contains("custom-class")).toBe(true);
    expect(buttonEl.classList.contains("btn")).toBe(true);
  });
});
