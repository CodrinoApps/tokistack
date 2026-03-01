import type { APIGatewayProxyEventV2, APIGatewayProxyEventV2WithLambdaAuthorizer } from "aws-lambda";
import type { AuthorizerContext } from "./authorizer.type";

export type PublicApiEvent = APIGatewayProxyEventV2;

export type PrivateApiEvent = APIGatewayProxyEventV2WithLambdaAuthorizer<AuthorizerContext>;
