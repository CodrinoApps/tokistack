import { Component, signal, viewChild } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { flushPromises } from "../../../testing/helpers";
import { ThemeService } from "../services/theme.service";
import { TurnstileService } from "../services/turnstile.service";
import { TurnstileDirective } from "./turnstile.directive";

@Component({
  template: `
    <div
      appTurnstile
      [sitekey]="sitekey"
      (token)="onToken($event)"
      (widgetError)="onWidgetError($event)"
      (expired)="onExpired()"
    ></div>
  `,
  imports: [TurnstileDirective],
})
class TestHostComponent {
  readonly directive = viewChild.required(TurnstileDirective);
  sitekey = "test-sitekey";
  onToken = vi.fn();
  onWidgetError = vi.fn();
  onExpired = vi.fn();
}

describe("TurnstileDirective", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  let mockTurnstile: {
    loadScript: ReturnType<typeof vi.fn>;
    render: ReturnType<typeof vi.fn>;
    reset: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };
  let resolvedTheme: ReturnType<typeof signal<"light" | "dark">>;

  beforeEach(async () => {
    mockTurnstile = {
      loadScript: vi.fn().mockResolvedValue(undefined),
      render: vi.fn().mockReturnValue("widget-1"),
      reset: vi.fn(),
      remove: vi.fn(),
    };
    resolvedTheme = signal<"light" | "dark">("light");

    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        { provide: TurnstileService, useValue: mockTurnstile },
        { provide: ThemeService, useValue: { resolvedTheme } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should load the script after first render", () => {
    expect(mockTurnstile.loadScript).toHaveBeenCalledOnce();
  });

  it("should render the widget with the correct sitekey and current theme", () => {
    expect(mockTurnstile.render).toHaveBeenCalledOnce();
    expect(mockTurnstile.render).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({ sitekey: "test-sitekey", theme: "light" }),
    );
  });

  it("should emit token when the Cloudflare callback fires", () => {
    const { callback } = mockTurnstile.render.mock.calls[0][1];
    callback("cf-token-123");
    expect(component.onToken).toHaveBeenCalledWith("cf-token-123");
  });

  it("should emit widgetError when the Cloudflare error callback fires", () => {
    const errorCallback = mockTurnstile.render.mock.calls[0][1]["error-callback"];
    errorCallback("error-code-110100");
    expect(component.onWidgetError).toHaveBeenCalledWith("error-code-110100");
  });

  it("should emit expired when the Cloudflare expired callback fires", () => {
    const expiredCallback = mockTurnstile.render.mock.calls[0][1]["expired-callback"];
    expiredCallback();
    expect(component.onExpired).toHaveBeenCalled();
  });

  it("should re-render with the new theme when the theme changes", () => {
    resolvedTheme.set("dark");
    TestBed.tick();
    expect(mockTurnstile.remove).toHaveBeenCalledWith("widget-1");
    expect(mockTurnstile.render).toHaveBeenCalledTimes(2);
    expect(mockTurnstile.render).toHaveBeenLastCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({ theme: "dark" }),
    );
  });

  it("should remove the widget on destroy", () => {
    fixture.destroy();
    expect(mockTurnstile.remove).toHaveBeenCalledWith("widget-1");
  });

  it("should call turnstile.reset with the widget ID", () => {
    component.directive().reset();
    expect(mockTurnstile.reset).toHaveBeenCalledWith("widget-1");
  });

  it("should emit widgetError when the script fails to load", async () => {
    mockTurnstile.loadScript.mockRejectedValueOnce(new Error("Failed to load Turnstile script"));

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    await flushPromises();

    expect(component.onWidgetError).toHaveBeenCalledWith("script-load-error");
  });
});
