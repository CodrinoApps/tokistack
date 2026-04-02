import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import translations from "@tokistack/i18n/locales/en.json";
import { SignInComponent } from "./sign-in";

function t(key: string): string {
  return (translations as Record<string, string>)[key];
}

function setInputValue(input: HTMLInputElement, value: string): void {
  input.value = value;
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("blur", { bubbles: true }));
}

describe("SignInComponent", () => {
  let component: SignInComponent;
  let fixture: ComponentFixture<SignInComponent>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignInComponent],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(SignInComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
    el = fixture.nativeElement;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should display the sign-in title and subtitle", () => {
    expect(fixture.nativeElement.querySelector(".title")!.textContent).toContain(t("auth.signIn.title"));
    expect(fixture.nativeElement.querySelector(".subtitle")!.textContent).toContain(t("auth.signIn.subtitle"));
  });

  describe("validation", () => {
    it("should show email required error when email is empty and touched", () => {
      setInputValue(el.querySelector("input[type=\"email\"]")!, "");
      fixture.detectChanges();

      expect(el.textContent).toContain(t("auth.signIn.validation.emailRequired"));
    });

    it("should show email invalid error for a malformed email", () => {
      setInputValue(el.querySelector("input[type=\"email\"]")!, "not-an-email");
      fixture.detectChanges();

      expect(el.textContent).toContain(t("auth.signIn.validation.emailInvalid"));
    });

    it("should show password required error when password is empty and touched", () => {
      setInputValue(el.querySelector("input[type=\"password\"]")!, "");
      fixture.detectChanges();

      expect(el.textContent).toContain(t("auth.signIn.validation.passwordRequired"));
    });

    it("should not show errors before the field is touched", () => {
      expect(el.textContent).not.toContain(t("auth.signIn.validation.emailRequired"));
      expect(el.textContent).not.toContain(t("auth.signIn.validation.passwordRequired"));
    });
  });
});
