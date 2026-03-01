import { db } from "@tokistack/db";
import { user } from "@tokistack/db/schema";
import { createApiEvent } from "@tokistack/test-utils";
import { HttpStatusCode } from "../src/common/http/status.constant";
import { handler } from "../src/index";

describe("handler", () => {
  it("returns 404 for an unmatched request", async () => {
    const response = await handler(createApiEvent("GET", "/nonexistent"));

    expect(response).toEqual(
      expect.objectContaining({
        statusCode: HttpStatusCode.NOT_FOUND,
      }),
    );

    const body = JSON.parse((response as { body: string }).body);
    expect(body.error).toMatch(/No route matched/);
  });
});

describe("API", () => {
  it("should connect to the database and query users", async () => {
    const users = await db.select().from(user);
    expect(users).toEqual([]);
  });
});
