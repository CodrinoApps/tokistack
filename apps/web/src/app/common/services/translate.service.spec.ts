import { TestBed } from "@angular/core/testing";
import { TranslationKey } from "@tokistack/i18n/generated";
import { LocalStorageService } from "./local-storage.service";
import { TranslateService } from "./translate.service";

const mockTranslations: Record<string, string> = {
  "common.hello": "Hello",
  "common.goodbye": "Goodbye",
};

describe("TranslateService", () => {
  let service: TranslateService;
  let storage: LocalStorageService;

  beforeEach(() => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve(mockTranslations),
    });

    localStorage.clear();
    TestBed.configureTestingModule({});
    storage = TestBed.inject(LocalStorageService);
    service = TestBed.inject(TranslateService);
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("should load translations after setLocale", async () => {
    await service.setLocale("en");

    expect(service.translations()).toEqual(mockTranslations);
    expect(service.locale()).toBe("en");
  });

  it("should persist locale to localStorage", async () => {
    await service.setLocale("fr");

    expect(storage.getString("locale")).toBe("fr");
  });

  it("should return the translated value for a known key", async () => {
    await service.setLocale("en");

    expect(service.t("common.hello" as TranslationKey)).toBe("Hello");
  });

  it("should return the key itself when translation is missing", async () => {
    await service.setLocale("en");

    expect(service.t("missing.key" as TranslationKey)).toBe("missing.key");
  });

  it("should update translations when switching locale", async () => {
    const frTranslations = { "common.hello": "Bonjour" };

    (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      json: () => Promise.resolve(frTranslations),
    });

    await service.setLocale("fr");

    expect(service.translations()).toEqual(frTranslations);
    expect(service.locale()).toBe("fr");
  });

  describe("with stored locale", () => {
    beforeEach(() => {
      vi.restoreAllMocks();
      globalThis.fetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve(mockTranslations),
      });

      localStorage.clear();
      localStorage.setItem("locale", "de");
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      service = TestBed.inject(TranslateService);
    });

    it("should use the stored locale if available", () => {
      service.setLocale("de");
      expect(fetch).toHaveBeenCalledWith("/locale/de.json");
    });
  });
});
