import { TestBed } from "@angular/core/testing";
import { LocalStorageService } from "./local-storage.service";
import { ThemeService } from "./theme.service";

function mockMatchMedia(prefersDark: boolean): void {
  const listeners: Array<(e: MediaQueryListEvent) => void> = [];
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    configurable: true,
    value: vi.fn().mockReturnValue({
      matches: prefersDark,
      addEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => listeners.push(cb),
      removeEventListener: (_: string, cb: (e: MediaQueryListEvent) => void) => {
        const idx = listeners.indexOf(cb);
        if (idx >= 0) listeners.splice(idx, 1);
      },
      dispatchChange: (matches: boolean) => {
        for (const cb of listeners) cb({ matches } as MediaQueryListEvent);
      },
    }),
  });
}

describe("ThemeService", () => {
  let service: ThemeService;
  let storage: LocalStorageService;

  afterEach(() => {
    localStorage.removeItem("theme");
    document.documentElement.removeAttribute("data-theme");
  });

  describe("with no stored preference", () => {
    beforeEach(() => {
      mockMatchMedia(false);
      TestBed.configureTestingModule({});
      storage = TestBed.inject(LocalStorageService);
      service = TestBed.inject(ThemeService);
    });

    it("should default to system", () => {
      expect(service.theme()).toBe("system");
    });

    it("should update theme signal and persist on setTheme", () => {
      service.setTheme("dark");
      expect(service.theme()).toBe("dark");
      expect(storage.getString("theme")).toBe("dark");
    });

    it("should apply data-theme attribute to document element", () => {
      service.setTheme("dark");
      TestBed.tick();
      expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    });

    it("should resolve light when explicitly set to light", () => {
      service.setTheme("light");
      expect(service.resolvedTheme()).toBe("light");
    });

    it("should resolve dark when explicitly set to dark", () => {
      service.setTheme("dark");
      expect(service.resolvedTheme()).toBe("dark");
    });
  });

  describe("with stored preference", () => {
    beforeEach(() => {
      mockMatchMedia(false);
      localStorage.setItem("theme", "light");
      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);
    });

    it("should restore persisted theme from localStorage", () => {
      expect(service.theme()).toBe("light");
    });
  });

  describe("with invalid stored value", () => {
    beforeEach(() => {
      mockMatchMedia(false);
      localStorage.setItem("theme", "invalid");
      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);
    });

    it("should fall back to system", () => {
      expect(service.theme()).toBe("system");
    });
  });

  describe("with OS preferring dark", () => {
    beforeEach(() => {
      mockMatchMedia(true);
      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);
    });

    it("should resolve system to dark", () => {
      service.setTheme("system");
      expect(service.resolvedTheme()).toBe("dark");
    });
  });

  describe("with OS preferring light", () => {
    beforeEach(() => {
      mockMatchMedia(false);
      TestBed.configureTestingModule({});
      service = TestBed.inject(ThemeService);
    });

    it("should resolve system to light", () => {
      service.setTheme("system");
      expect(service.resolvedTheme()).toBe("light");
    });
  });
});
