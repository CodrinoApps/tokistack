import { HttpStatusCode } from "../http/status.constant";

export class ApiError extends Error {
  readonly statusCode: HttpStatusCode;
  readonly details?: unknown;

  constructor(statusCode: HttpStatusCode, message: string, details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class BadRequestError extends ApiError {
  constructor(message = "Bad request", details?: unknown) {
    super(HttpStatusCode.BAD_REQUEST, message, details);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized", details?: unknown) {
    super(HttpStatusCode.UNAUTHORIZED, message, details);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = "Forbidden", details?: unknown) {
    super(HttpStatusCode.FORBIDDEN, message, details);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "Not found", details?: unknown) {
    super(HttpStatusCode.NOT_FOUND, message, details);
  }
}

export class ConflictError extends ApiError {
  constructor(message = "Conflict", details?: unknown) {
    super(HttpStatusCode.CONFLICT, message, details);
  }
}
