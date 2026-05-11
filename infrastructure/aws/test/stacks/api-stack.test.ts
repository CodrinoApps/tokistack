import { Match, Template } from "aws-cdk-lib/assertions";
import * as cdk from "aws-cdk-lib/core";
import { ApiStack } from "../../src/stacks/api-stack";

function makeApiStack() {
  const app = new cdk.App();
  const stack = new ApiStack(app, "TestApi", {
    env: { account: "123456789012", region: "eu-central-1" },
    clusterName: "testing",
  });
  return Template.fromStack(stack);
}

describe("ApiStack", () => {
  let template: Template;
  beforeAll(() => {
    template = makeApiStack();
  });

  test("exactly three Lambda functions are created", () => {
    template.resourceCountIs("AWS::Lambda::Function", 3);
  });

  test("Lambda function name follows tokistack-{cluster}-api convention", () => {
    template.hasResourceProperties("AWS::Lambda::Function", {
      FunctionName: "tokistack-testing-api",
    });
  });

  test("Authorizer function name follows tokistack-{cluster}-authorizer convention", () => {
    template.hasResourceProperties("AWS::Lambda::Function", {
      FunctionName: "tokistack-testing-authorizer",
    });
  });

  test("Auth function name follows tokistack-{cluster}-auth convention", () => {
    template.hasResourceProperties("AWS::Lambda::Function", {
      FunctionName: "tokistack-testing-auth",
    });
  });

  test("Lambda uses Node.js 24 runtime", () => {
    template.hasResourceProperties("AWS::Lambda::Function", {
      Runtime: "nodejs24.x",
    });
  });

  test("HTTP API has a Lambda authorizer configured", () => {
    template.resourceCountIs("AWS::ApiGatewayV2::Authorizer", 1);
    template.hasResourceProperties("AWS::ApiGatewayV2::Authorizer", {
      AuthorizerType: "REQUEST",
      AuthorizerPayloadFormatVersion: "2.0",
      EnableSimpleResponses: true,
    });
  });

  test("auth routes are public (no authorizer)", () => {
    template.hasResourceProperties("AWS::ApiGatewayV2::Route", {
      RouteKey: "ANY /api/auth/{proxy+}",
      AuthorizationType: "NONE",
    });
  });

  test("catch-all route is protected by the authorizer", () => {
    template.hasResourceProperties("AWS::ApiGatewayV2::Route", {
      RouteKey: "ANY /{proxy+}",
      AuthorizationType: "CUSTOM",
    });
  });

  test("exactly one HTTP API is created", () => {
    template.resourceCountIs("AWS::ApiGatewayV2::Api", 1);
  });

  test("HTTP API name follows tokistack-{cluster}-api convention", () => {
    template.hasResourceProperties("AWS::ApiGatewayV2::Api", {
      Name: "tokistack-testing-api",
      ProtocolType: "HTTP",
    });
  });

  test("$default stage has throttling configured", () => {
    template.hasResourceProperties("AWS::ApiGatewayV2::Stage", {
      StageName: "$default",
      DefaultRouteSettings: Match.objectLike({
        ThrottlingBurstLimit: 50,
        ThrottlingRateLimit: 25,
      }),
    });
  });
});
