import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../../src/common/errors/api-error";
import { handleError } from "../../src/common/errors/error-handler";
import { HttpStatusCode } from "../../src/common/http/status.constant";

jest.mock("@tokistack/logger", () => ({
  logger: { warn: jest.fn(), error: jest.fn() },
}));

describe("handleError", () => {
  it.each([
    [new BadRequestError(), HttpStatusCode.BAD_REQUEST, "Bad request"],
    [new UnauthorizedError(), HttpStatusCode.UNAUTHORIZED, "Unauthorized"],
    [new ForbiddenError(), HttpStatusCode.FORBIDDEN, "Forbidden"],
    [new NotFoundError(), HttpStatusCode.NOT_FOUND, "Not found"],
    [new ConflictError(), HttpStatusCode.CONFLICT, "Conflict"],
  ])("returns %s status for %s", (error, expectedStatus, expectedMessage) => {
    const response = handleError(error);
    expect(response).toEqual({
      statusCode: expectedStatus,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: expectedMessage }),
    });
  });

  it("includes details when provided", () => {
    const error = new BadRequestError("Invalid input", { field: "email" });
    const response = handleError(error);
    expect(response).toEqual({
      statusCode: HttpStatusCode.BAD_REQUEST,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        error: "Invalid input",
        details: { field: "email" },
      }),
    });
  });

  it("returns 500 for unknown errors", () => {
    const response = handleError(new Error("something broke"));
    expect(response).toEqual({
      statusCode: HttpStatusCode.INTERNAL_SERVER_ERROR,
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ error: "Internal server error" }),
    });
  });
});
