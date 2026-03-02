import { Match, Template } from "aws-cdk-lib/assertions";
import * as cdk from "aws-cdk-lib/core";
import { ApiStack } from "../src/stacks/api-stack";
import { ArtifactsStack } from "../src/stacks/artifacts-stack";

function makeArtifactsStack() {
  const app = new cdk.App();
  const stack = new ArtifactsStack(app, "TestArtifacts", {
    env: { account: "123456789012", region: "eu-central-1" },
    clusterName: "testing",
  });
  return Template.fromStack(stack);
}

function makeApiStack() {
  const app = new cdk.App();
  const stack = new ApiStack(app, "TestApi", {
    env: { account: "123456789012", region: "eu-central-1" },
    clusterName: "testing",
  });
  return Template.fromStack(stack);
}

describe("ArtifactsStack", () => {
  let template: Template;
  beforeAll(() => {
    template = makeArtifactsStack();
  });

  test("bucket name follows tokistack-{cluster}-artifacts convention", () => {
    template.hasResourceProperties("AWS::S3::Bucket", {
      BucketName: "tokistack-testing-artifacts",
    });
  });

  test("bucket blocks all public access", () => {
    template.hasResourceProperties("AWS::S3::Bucket", {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
    });
  });

  test("bucket enforces SSL via bucket policy", () => {
    template.hasResourceProperties("AWS::S3::BucketPolicy", {
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Effect: "Deny",
            Condition: { Bool: { "aws:SecureTransport": "false" } },
          }),
        ]),
      },
    });
  });

  test("bucket uses S3-managed encryption", () => {
    template.hasResourceProperties("AWS::S3::Bucket", {
      BucketEncryption: {
        ServerSideEncryptionConfiguration: [
          { ServerSideEncryptionByDefault: { SSEAlgorithm: "AES256" } },
        ],
      },
    });
  });

  test("bucket has 90-day lifecycle expiry on artifacts", () => {
    template.hasResourceProperties("AWS::S3::Bucket", {
      LifecycleConfiguration: {
        Rules: Match.arrayWith([
          Match.objectLike({
            ExpirationInDays: 90,
            Status: "Enabled",
          }),
        ]),
      },
    });
  });

  test("bucket logical ID is stable (rename guard for stateful resource)", () => {
    template.templateMatches(
      Match.objectLike({
        Resources: Match.objectLike({
          ArtifactsBucket2AAC5544: Match.objectLike({
            Type: "AWS::S3::Bucket",
          }),
        }),
      }),
    );
  });
});

describe("ApiStack", () => {
  let template: Template;
  beforeAll(() => {
    template = makeApiStack();
  });

  test("exactly two Lambda functions are created", () => {
    template.resourceCountIs("AWS::Lambda::Function", 2);
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

  test("Lambda uses Node.js 24 runtime on ARM", () => {
    template.hasResourceProperties("AWS::Lambda::Function", {
      Runtime: "nodejs24.x",
      Architectures: ["arm64"],
    });
  });

  test("API Lambda log group has 30-day retention", () => {
    template.hasResourceProperties("AWS::Logs::LogGroup", {
      LogGroupName: "/aws/lambda/tokistack-testing-api",
      RetentionInDays: 30,
    });
  });

  test("Authorizer Lambda log group has 30-day retention", () => {
    template.hasResourceProperties("AWS::Logs::LogGroup", {
      LogGroupName: "/aws/lambda/tokistack-testing-authorizer",
      RetentionInDays: 30,
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

  test("Lambda is granted read access to the artifacts bucket", () => {
    template.hasResourceProperties("AWS::IAM::Policy", {
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Effect: "Allow",
            Action: Match.arrayWith(["s3:GetObject*", "s3:GetBucket*"]),
          }),
        ]),
      },
    });
  });
});
