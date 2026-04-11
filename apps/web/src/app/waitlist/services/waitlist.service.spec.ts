import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { WaitlistService } from "./waitlist.service";

describe("WaitlistService", () => {
  let service: WaitlistService;
  let httpTesting: HttpTestingController;

  const payload = { email: "test@example.com", language: "en", turnstileToken: "token123" };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(WaitlistService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it("should POST to the waitlist signup endpoint with the correct payload", async () => {
    const promise = service.signup(payload);

    const req = httpTesting.expectOne("/api/waitlist/signup");
    expect(req.request.method).toBe("POST");
    expect(req.request.body).toEqual(payload);
    req.flush(null);

    await promise;
  });

  it("should resolve without a value on success", async () => {
    const promise = service.signup(payload);
    httpTesting.expectOne("/api/waitlist/signup").flush(null);
    await expect(promise).resolves.toBeUndefined();
  });

  it("should throw an error with the message from the response body", async () => {
    const promise = service.signup(payload);
    httpTesting
      .expectOne("/api/waitlist/signup")
      .flush({ error: "Email already registered" }, { status: 400, statusText: "Bad Request" });
    await expect(promise).rejects.toThrow("Email already registered");
  });

  it("should throw a generic error when the response body has no error message", async () => {
    const promise = service.signup(payload);
    httpTesting
      .expectOne("/api/waitlist/signup")
      .flush(null, { status: 500, statusText: "Internal Server Error" });
    await expect(promise).rejects.toThrow("Signup failed");
  });
});
