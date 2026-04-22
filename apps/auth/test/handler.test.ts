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

  it("merges event.cookies into the Cookie header", () => {
    const event = createApiEvent("GET", "/api/auth/get-session", {
      cookies: ["session=abc", "csrf=xyz"],
    });
    const request = eventToRequest(event);

    expect(request.headers.get("cookie")).toBe("session=abc; csrf=xyz");
  });

  it("does not overwrite a Cookie header already present in event.headers", () => {
    const event = createApiEvent("GET", "/api/auth/get-session", {
      headers: { cookie: "existing=1" },
      cookies: ["session=abc"],
    });
    const request = eventToRequest(event);

    expect(request.headers.get("cookie")).toBe("existing=1");
  });

  it("does not set Cookie header when event.cookies is empty", () => {
    const event = createApiEvent("GET", "/api/auth/get-session", { cookies: [] });
    const request = eventToRequest(event);

    expect(request.headers.get("cookie")).toBeNull();
  });

  it("decodes a base64-encoded body", async () => {
    const original = JSON.stringify({ email: "a@b.com", password: "secret" });
    const encoded = Buffer.from(original).toString("base64");
    const event = createApiEvent("POST", "/api/auth/sign-in/email", {
      body: encoded,
      isBase64Encoded: true,
      headers: { "content-type": "application/json" },
    });
    const request = eventToRequest(event);
    const text = await request.text();

    expect(text).toBe(original);
  });

  it("passes a plain text body through unchanged", async () => {
    const body = JSON.stringify({ email: "a@b.com" });
    const event = createApiEvent("POST", "/api/auth/sign-in/email", {
      body,
      isBase64Encoded: false,
      headers: { "content-type": "application/json" },
    });
    const request = eventToRequest(event);

    expect(await request.text()).toBe(body);
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
