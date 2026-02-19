#!/usr/bin/env node
import * as cdk from "aws-cdk-lib/core";
import { ApiStack } from "./stacks/api-stack";
import { ArtifactsStack } from "./stacks/artifacts-stack";

const app = new cdk.App();

const clusterName = app.node.tryGetContext("cluster") as string | undefined;
if (!clusterName) {
  throw new Error("CDK context \"cluster\" is required. Pass -c cluster=<name> or set in cdk.json.");
}

const env: cdk.Environment = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

new ArtifactsStack(app, "TokistackArtifacts", { env, clusterName });
new ApiStack(app, "TokistackApi", { env, clusterName });
