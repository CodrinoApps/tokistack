import { Match, Template } from "aws-cdk-lib/assertions";
import * as cdk from "aws-cdk-lib/core";
import { ArtifactsStack } from "../../src/stacks/artifacts-stack";

function makeArtifactsStack() {
  const app = new cdk.App();
  const stack = new ArtifactsStack(app, "TestArtifacts", {
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
