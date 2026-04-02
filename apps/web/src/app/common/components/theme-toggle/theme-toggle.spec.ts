import { ComponentFixture, TestBed } from "@angular/core/testing";
import translations from "@tokistack/i18n/locales/en.json";
import { ThemeToggleComponent } from "./theme-toggle";

describe("ThemeToggleComponent", () => {
  let component: ThemeToggleComponent;
  let fixture: ComponentFixture<ThemeToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ThemeToggleComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ThemeToggleComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should expose three theme options with correct values", () => {
    const options = component.themeOptions();
    expect(options).toHaveLength(3);
    expect(options.map((o) => o.value)).toEqual(["light", "dark", "system"]);
  });

  it("should use translated labels", () => {
    const options = component.themeOptions();
    expect(options[0].label).toBe(translations["layout.themeToggle.light"]);
    expect(options[1].label).toBe(translations["layout.themeToggle.dark"]);
    expect(options[2].label).toBe(translations["layout.themeToggle.system"]);
  });

  it("should default value to system", () => {
    expect(component.value()).toBe("system");
  });
});
