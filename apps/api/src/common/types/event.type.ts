import type { APIGatewayProxyEventV2, APIGatewayProxyEventV2WithLambdaAuthorizer } from "aws-lambda";
import type { AuthorizerContext } from "./authorizer.type";

export type ParsedApiEvent = APIGatewayProxyEventV2 & { parsedBody: unknown };

export type PublicApiEvent = ParsedApiEvent;

export type PrivateApiEvent = APIGatewayProxyEventV2WithLambdaAuthorizer<AuthorizerContext> & { parsedBody: unknown };
