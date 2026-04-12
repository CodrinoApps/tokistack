import { Directive, input, output } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormField } from "@angular/forms/signals";
import { ButtonComponent } from "@tokistack/ui/button";
import { TokiCheckboxComponent } from "@tokistack/ui/checkbox";
import { TokiInputComponent } from "@tokistack/ui/input";
import { checkCheckbox, setInputValue, t } from "../../testing/helpers";
import { WaitlistService } from "./services/waitlist.service";
import { WaitlistComponent } from "./waitlist";

@Directive({ selector: "[appTurnstile]" })
class TurnstileStub {
  sitekey = input.required<string>();
  action = input<string | undefined>(undefined);
  token = output<string>();
  widgetError = output<string>();
  expired = output<void>();
}

describe("WaitlistComponent", () => {
  let component: WaitlistComponent;
  let fixture: ComponentFixture<WaitlistComponent>;
  let el: HTMLElement;
  let mockSignup: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    mockSignup = vi.fn().mockResolvedValue(undefined);

    await TestBed.configureTestingModule({
      imports: [WaitlistComponent],
      providers: [{ provide: WaitlistService, useValue: { signup: mockSignup } }],
    })
      .overrideComponent(WaitlistComponent, {
        set: { imports: [ButtonComponent, FormField, TokiCheckboxComponent, TokiInputComponent, TurnstileStub] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(WaitlistComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
    el = fixture.nativeElement;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should display the title and subtitle", () => {
    expect(el.querySelector(".title")!.textContent).toContain(t("waitlist.title"));
    expect(el.querySelector(".subtitle")!.textContent).toContain(t("waitlist.subtitle"));
  });

  it("should show the form and not the success state initially", () => {
    expect(el.querySelector("form")).toBeTruthy();
    expect(el.querySelector(".success")).toBeFalsy();
  });

  describe("validation", () => {
    it("should show email required error when email is empty and touched", () => {
      setInputValue(el.querySelector("input[type='email']")!, "");
      fixture.detectChanges();
      expect(el.textContent).toContain(t("waitlist.validation.emailRequired"));
    });

    it("should show email invalid error for a malformed email", () => {
      setInputValue(el.querySelector("input[type='email']")!, "not-an-email");
      fixture.detectChanges();
      expect(el.textContent).toContain(t("waitlist.validation.emailInvalid"));
    });

    it("should not show validation errors before the field is touched", () => {
      expect(el.textContent).not.toContain(t("waitlist.validation.emailRequired"));
    });

    it("should render translated text, not raw translation keys", () => {
      setInputValue(el.querySelector("input[type='email']")!, "");
      fixture.detectChanges();
      const errorEl = el.querySelector(".input__error")!;
      expect(errorEl.textContent).not.toMatch(/^[\w]+\.[\w.]+$/);
    });
  });

  describe("submit guards", () => {
    it("should not call the service when the email is invalid", async () => {
      setInputValue(el.querySelector("input[type='email']")!, "not-an-email");
      component.turnstileToken.set("test-token");
      await component.onSubmit(new Event("submit"));
      expect(mockSignup).not.toHaveBeenCalled();
    });

    it("should not call the service when the turnstile token is missing", async () => {
      setInputValue(el.querySelector("input[type='email']")!, "test@example.com");
      component.turnstileToken.set("");
      await component.onSubmit(new Event("submit"));
      expect(mockSignup).not.toHaveBeenCalled();
    });

    it("should not call the service when consent is not checked", async () => {
      setInputValue(el.querySelector("input[type='email']")!, "test@example.com");
      component.turnstileToken.set("test-token");
      // consent remains unchecked
      await component.onSubmit(new Event("submit"));
      expect(mockSignup).not.toHaveBeenCalled();
    });

    it("should show an error banner when the turnstile token is missing", async () => {
      setInputValue(el.querySelector("input[type='email']")!, "test@example.com");
      checkCheckbox(el);
      component.turnstileToken.set("");
      await component.onSubmit(new Event("submit"));
      fixture.detectChanges();
      expect(el.querySelector(".error-banner")).toBeTruthy();
    });
  });

  describe("successful submission", () => {
    beforeEach(() => {
      setInputValue(el.querySelector("input[type='email']")!, "test@example.com");
      checkCheckbox(el);
      component.turnstileToken.set("test-token");
      fixture.detectChanges();
    });

    it("should call the service with the correct payload", async () => {
      await component.onSubmit(new Event("submit"));
      expect(mockSignup).toHaveBeenCalledWith({
        email: "test@example.com",
        language: expect.any(String),
        turnstileToken: "test-token",
      });
    });

    it("should show the success state", async () => {
      await component.onSubmit(new Event("submit"));
      fixture.detectChanges();
      expect(el.querySelector(".success")).toBeTruthy();
      expect(el.querySelector("form")).toBeFalsy();
    });

    it("should display the success title", async () => {
      await component.onSubmit(new Event("submit"));
      fixture.detectChanges();
      expect(el.querySelector(".title")!.textContent).toContain(t("waitlist.success.title"));
    });
  });

  describe("failed submission", () => {
    beforeEach(() => {
      mockSignup.mockRejectedValue(new Error("Signup failed"));
      setInputValue(el.querySelector("input[type='email']")!, "test@example.com");
      checkCheckbox(el);
      component.turnstileToken.set("test-token");
      fixture.detectChanges();
    });

    it("should show the error banner", async () => {
      await component.onSubmit(new Event("submit"));
      fixture.detectChanges();
      expect(el.querySelector(".error-banner")).toBeTruthy();
    });

    it("should display the generic error translation", async () => {
      await component.onSubmit(new Event("submit"));
      fixture.detectChanges();
      expect(el.querySelector(".error-banner")!.textContent).toContain(t("waitlist.error.generic"));
    });

    it("should reset the turnstile token", async () => {
      await component.onSubmit(new Event("submit"));
      expect(component.turnstileToken()).toBe("");
    });

    it("should not show the success state", async () => {
      await component.onSubmit(new Event("submit"));
      fixture.detectChanges();
      expect(el.querySelector(".success")).toBeFalsy();
    });
  });
});
