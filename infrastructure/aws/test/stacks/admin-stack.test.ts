import { Template } from "aws-cdk-lib/assertions";
import * as cdk from "aws-cdk-lib/core";
import { AdminStack } from "../../src/stacks/admin-stack";

function makeAdminStack() {
  const app = new cdk.App();
  const stack = new AdminStack(app, "TestAdmin", {
    env: { account: "123456789012", region: "eu-central-1" },
    clusterName: "testing",
  });
  return Template.fromStack(stack);
}

describe("AdminStack", () => {
  let template: Template;
  beforeAll(() => {
    template = makeAdminStack();
  });

  test("exactly one Lambda function is created", () => {
    template.resourceCountIs("AWS::Lambda::Function", 1);
  });

  test("function name follows tokistack-{cluster}-admin convention", () => {
    template.hasResourceProperties("AWS::Lambda::Function", {
      FunctionName: "tokistack-testing-admin",
    });
  });

  test("Lambda uses PROVIDED_AL2023 runtime", () => {
    template.hasResourceProperties("AWS::Lambda::Function", {
      Runtime: "provided.al2023",
    });
  });

  test("memory size is 256 MB", () => {
    template.hasResourceProperties("AWS::Lambda::Function", {
      MemorySize: 256,
    });
  });

  test("stack has a hashOrVersion CloudFormation parameter", () => {
    template.hasParameter("hashOrVersion", {
      Type: "String",
    });
  });
});
