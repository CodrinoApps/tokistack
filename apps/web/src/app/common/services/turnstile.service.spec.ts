import { DOCUMENT } from "@angular/common";
import { TestBed } from "@angular/core/testing";
import { TurnstileRenderOptions, TurnstileService } from "./turnstile.service";

describe("TurnstileService", () => {
  let service: TurnstileService;
  let doc: Document;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TurnstileService);
    doc = TestBed.inject(DOCUMENT);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    doc.head.querySelectorAll("script").forEach((s) => s.remove());
  });

  describe("loadScript()", () => {
    it("should append an async script pointing to the Cloudflare Turnstile API", () => {
      service.loadScript();
      const script = doc.head.querySelector("script") as HTMLScriptElement;
      expect(script).toBeTruthy();
      expect(script.src).toContain("challenges.cloudflare.com");
      expect(script.async).toBe(true);
    });

    it("should resolve when the script loads", async () => {
      const promise = service.loadScript();
      doc.head.querySelector("script")!.dispatchEvent(new Event("load"));
      await expect(promise).resolves.toBeUndefined();
    });

    it("should reject when the script fails to load", async () => {
      const promise = service.loadScript();
      doc.head.querySelector("script")!.dispatchEvent(new Event("error"));
      await expect(promise).rejects.toThrow("Failed to load Turnstile script");
    });

    it("should return the same promise on subsequent calls without re-appending the script", () => {
      const p1 = service.loadScript();
      const p2 = service.loadScript();
      expect(p1).toBe(p2);
      expect(doc.head.querySelectorAll("script")).toHaveLength(1);
    });
  });

  describe("Turnstile API delegation", () => {
    let mockApi: {
      render: ReturnType<typeof vi.fn>;
      reset: ReturnType<typeof vi.fn>;
      remove: ReturnType<typeof vi.fn>;
    };

    beforeEach(() => {
      mockApi = {
        render: vi.fn().mockReturnValue("widget-1"),
        reset: vi.fn(),
        remove: vi.fn(),
      };
      Object.defineProperty(doc.defaultView, "turnstile", {
        value: mockApi,
        writable: true,
        configurable: true,
      });
    });

    afterEach(() => {
      Reflect.deleteProperty(doc.defaultView as object, "turnstile");
    });

    it("render() should delegate to window.turnstile.render and return the widget ID", () => {
      const container = doc.createElement("div");
      const options: TurnstileRenderOptions = {
        sitekey: "test-key",
        theme: "light",
        callback: vi.fn(),
        "error-callback": vi.fn(),
        "expired-callback": vi.fn(),
      };
      const widgetId = service.render(container, options);
      expect(mockApi.render).toHaveBeenCalledWith(container, options);
      expect(widgetId).toBe("widget-1");
    });

    it("reset() should delegate to window.turnstile.reset", () => {
      service.reset("widget-1");
      expect(mockApi.reset).toHaveBeenCalledWith("widget-1");
    });

    it("remove() should delegate to window.turnstile.remove", () => {
      service.remove("widget-1");
      expect(mockApi.remove).toHaveBeenCalledWith("widget-1");
    });
  });
});
