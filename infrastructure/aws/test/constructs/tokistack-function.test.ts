import { Match, Template } from "aws-cdk-lib/assertions";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cdk from "aws-cdk-lib/core";
import { TokistackFunction } from "../../src/constructs/tokistack-function";

function makeStack(runtimeOverride?: lambda.Runtime) {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, "TestStack", {
    env: { account: "123456789012", region: "eu-central-1" },
  });
  const bucket = new s3.Bucket(stack, "Bucket");
  new TokistackFunction(stack, "TestFunction", {
    clusterName: "testing",
    name: "worker",
    runtime: runtimeOverride ?? lambda.Runtime.NODEJS_24_X,
    memorySize: 256,
    timeout: cdk.Duration.seconds(10),
    artifactsBucket: bucket,
    artifactKey: "abc123/worker",
  });
  return Template.fromStack(stack);
}

describe("TokistackFunction", () => {
  let template: Template;
  beforeAll(() => {
    template = makeStack();
  });

  test("function name follows tokistack-{cluster}-{name} convention", () => {
    template.hasResourceProperties("AWS::Lambda::Function", {
      FunctionName: "tokistack-testing-worker",
    });
  });

  test("function uses ARM64 architecture", () => {
    template.hasResourceProperties("AWS::Lambda::Function", {
      Architectures: ["arm64"],
    });
  });

  test("function uses index.handler for Node.js runtime", () => {
    template.hasResourceProperties("AWS::Lambda::Function", {
      Handler: "index.handler",
    });
  });

  test("function uses bootstrap handler for PROVIDED_AL2023 runtime", () => {
    const nativeTemplate = makeStack(lambda.Runtime.PROVIDED_AL2023);
    nativeTemplate.hasResourceProperties("AWS::Lambda::Function", {
      Handler: "bootstrap",
    });
  });

  test("log group name follows /aws/lambda/tokistack-{cluster}-{name} convention", () => {
    template.hasResourceProperties("AWS::Logs::LogGroup", {
      LogGroupName: "/aws/lambda/tokistack-testing-worker",
    });
  });

  test("log group has 30-day retention", () => {
    template.hasResourceProperties("AWS::Logs::LogGroup", {
      LogGroupName: "/aws/lambda/tokistack-testing-worker",
      RetentionInDays: 30,
    });
  });

  test("function has the Parameters and Secrets extension layer", () => {
    template.hasResourceProperties("AWS::Lambda::Function", {
      Layers: [
        Match.stringLikeRegexp("arn:aws:lambda:.+:layer:AWS-Parameters-and-Secrets-Lambda-Extension-Arm64"),
      ],
    });
  });

  test("function is granted read access to SSM parameters under tokistack/* with resolved account and region", () => {
    template.hasResourceProperties("AWS::IAM::Policy", {
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Effect: "Allow",
            Action: "ssm:GetParameter*",
            Resource: {
              "Fn::Join": [
                "",
                [
                  "arn:",
                  { Ref: "AWS::Partition" },
                  ":ssm:eu-central-1:123456789012:parameter/tokistack/*",
                ],
              ],
            },
          }),
        ]),
      },
    });
  });

  test("function is granted read access to the artifacts bucket", () => {
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
