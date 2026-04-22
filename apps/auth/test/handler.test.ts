import { createApiEvent } from "@tokistack/test-utils/api-event";
import { describe, expect, it } from "vitest";
import { eventToRequest, responseToResult } from "../src/index";

describe("eventToRequest", () => {
  it("builds a Request with the correct URL and method", () => {
    const event = createApiEvent("POST", "/api/auth/sign-in/email");
    const request = eventToRequest(event);

    expect(request.method).toBe("POST");
    expect(request.url).toContain("/api/auth/sign-in/email");
  });

  it("appends query string when present", () => {
    const event = createApiEvent("GET", "/api/auth/get-session", { rawQueryString: "foo=bar" });
    const request = eventToRequest(event);

    expect(request.url).toContain("?foo=bar");
  });

  it("omits query string when empty", () => {
    const event = createApiEvent("GET", "/api/auth/get-session", { rawQueryString: "" });
    const request = eventToRequest(event);

    expect(request.url).not.toContain("?");
  });

  it("forwards request headers", () => {
    const event = createApiEvent("POST", "/api/auth/sign-in/email", {
      headers: { "content-type": "application/json", "x-custom": "value" },
    });
    const request = eventToRequest(event);

    expect(request.headers.get("content-type")).toBe("application/json");
    expect(request.headers.get("x-custom")).toBe("value");
  });

  it("omits body for GET requests", () => {
    const event = createApiEvent("GET", "/api/auth/get-session");
    const request = eventToRequest(event);

    expect(request.body).toBeNull();
  });
});

describe("responseToResult", () => {
  it("maps status code, headers, and body", async () => {
    const response = new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });

    const result = await responseToResult(response);

    expect(result.statusCode).toBe(200);
    expect(result.headers?.["content-type"]).toBe("application/json");
    expect(result.body).toBe(JSON.stringify({ ok: true }));
  });

  it("handles non-200 status codes", async () => {
    const response = new Response("Unauthorized", { status: 401 });
    const result = await responseToResult(response);

    expect(result.statusCode).toBe(401);
    expect(result.body).toBe("Unauthorized");
  });

  it("extracts Set-Cookie headers into the cookies array", async () => {
    const headers = new Headers({ "content-type": "application/json" });
    headers.append("set-cookie", "session=abc; HttpOnly; Path=/");
    headers.append("set-cookie", "csrf=xyz; Path=/");
    const response = new Response("{}", { status: 200, headers });

    const result = await responseToResult(response);

    expect(result.cookies).toEqual(expect.arrayContaining(["session=abc; HttpOnly; Path=/", "csrf=xyz; Path=/"]));
    expect(result.headers?.["set-cookie"]).toBeUndefined();
  });

  it("omits cookies field when no Set-Cookie headers are present", async () => {
    const response = new Response("{}", { status: 200 });
    const result = await responseToResult(response);

    expect(result.cookies).toBeUndefined();
  });
});
