import { TestBed } from "@angular/core/testing";
import { LocalStorageService } from "./local-storage.service";

describe("LocalStorageService", () => {
  let service: LocalStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalStorageService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should return null for a key that does not exist", () => {
    expect(service.getString("nonexistent")).toBeNull();
  });

  it("should store and retrieve a string value", () => {
    service.setString("key", "value");
    expect(service.getString("key")).toBe("value");
  });

  it("should overwrite an existing value", () => {
    service.setString("key", "first");
    service.setString("key", "second");
    expect(service.getString("key")).toBe("second");
  });

  it("should remove a stored value", () => {
    service.setString("key", "value");
    service.remove("key");
    expect(service.getString("key")).toBeNull();
  });

  it("should not throw when removing a key that does not exist", () => {
    expect(() => service.remove("nonexistent")).not.toThrow();
  });
});
