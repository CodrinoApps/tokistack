import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";
import { TokistackFunction } from "../constructs/tokistack-function";

interface AdminStackProps extends cdk.StackProps {
  clusterName: string;
}

export class AdminStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: AdminStackProps) {
    super(scope, id, props);

    const hashOrVersion = new cdk.CfnParameter(this, "hashOrVersion", {
      type: "String",
      description: "Git commit SHA or semver tag referencing the Lambda artifact in S3",
    });

    const artifactsBucket = s3.Bucket.fromBucketName(
      this,
      "ArtifactsBucket",
      `tokistack-${props.clusterName}-artifacts`,
    );

    new TokistackFunction(this, "AdminFunction", {
      clusterName: props.clusterName,
      name: "admin",
      runtime: lambda.Runtime.PROVIDED_AL2023,
      memorySize: 256,
      timeout: cdk.Duration.seconds(15),
      artifactsBucket,
      artifactKey: `${hashOrVersion.valueAsString}/admin`,
    });
  }
}
