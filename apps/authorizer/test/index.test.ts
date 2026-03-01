import type { APIGatewayRequestAuthorizerEventV2 } from "aws-lambda";
import { handler } from "../src/index";

jest.mock("@tokistack/logger", () => ({
  logger: { info: jest.fn() },
}));

const { logger } = jest.requireMock<{ logger: { info: jest.Mock } }>("@tokistack/logger");

const mockEvent: APIGatewayRequestAuthorizerEventV2 = {
  version: "2.0",
  type: "REQUEST",
  routeArn: "arn:aws:execute-api:eu-central-1:123456789012:api-id/$default/GET/",
  identitySource: ["Bearer token"],
  cookies: [],
  routeKey: "$default",
  rawPath: "/",
  rawQueryString: "",
  headers: {},
  requestContext: {
    accountId: "123456789012",
    apiId: "api-id",
    domainName: "api-id.execute-api.eu-central-1.amazonaws.com",
    domainPrefix: "api-id",
    http: {
      method: "GET",
      path: "/",
      protocol: "HTTP/1.1",
      sourceIp: "127.0.0.1",
      userAgent: "test",
    },
    requestId: "request-id",
    routeKey: "$default",
    stage: "$default",
    time: "01/Jan/2025:00:00:00 +0000",
    timeEpoch: 1735689600000,
  },
};

describe("Authorizer", () => {
  it("should return isAuthorized false", async () => {
    const result = await handler(mockEvent);
    expect(result).toEqual({ isAuthorized: false });
  });

  it("should log the event", async () => {
    await handler(mockEvent);
    expect(logger.info).toHaveBeenCalledWith(mockEvent, "Authorizer invoked");
  });
});
