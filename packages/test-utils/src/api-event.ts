import type { APIGatewayProxyEventV2 } from "aws-lambda";

/**
 * Creates a minimal API Gateway V2 proxy event for use in handler tests.
 */
export function createApiEvent(
  method: string,
  path: string,
  overrides?: Partial<APIGatewayProxyEventV2>,
): APIGatewayProxyEventV2 {
  return {
    rawPath: path,
    requestContext: {
      http: { method, path, protocol: "HTTP/1.1", sourceIp: "127.0.0.1", userAgent: "test" },
      accountId: "123",
      apiId: "api",
      domainName: "localhost",
      domainPrefix: "localhost",
      requestId: "req-1",
      routeKey: `${method} ${path}`,
      stage: "$default",
      time: "01/Jan/2025:00:00:00 +0000",
      timeEpoch: 0,
    },
    headers: {},
    isBase64Encoded: false,
    routeKey: `${method} ${path}`,
    version: "2.0",
    ...overrides,
  } as APIGatewayProxyEventV2;
}
