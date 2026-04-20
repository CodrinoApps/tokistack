import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as logs from "aws-cdk-lib/aws-logs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";

interface TokistackFunctionProps {
  clusterName: string;
  name: string;
  runtime: lambda.Runtime;
  memorySize: number;
  timeout: cdk.Duration;
  artifactsBucket: s3.IBucket;
  artifactKey: string;
}

export class TokistackFunction extends Construct {
  public readonly function: lambda.Function;

  constructor(scope: Construct, id: string, props: TokistackFunctionProps) {
    super(scope, id);

    const logGroup = new logs.LogGroup(this, "LogGroup", {
      logGroupName: `/aws/lambda/tokistack-${props.clusterName}-${props.name}`,
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const paramsAndSecrets = lambda.ParamsAndSecretsLayerVersion.fromVersion(
      lambda.ParamsAndSecretsVersions.V1_0_103,
    );

    this.function = new lambda.Function(this, "Default", {
      functionName: `tokistack-${props.clusterName}-${props.name}`,
      runtime: props.runtime,
      architecture: lambda.Architecture.ARM_64,
      handler: props.runtime === lambda.Runtime.PROVIDED_AL2023 ? "bootstrap" : "index.handler",
      code: lambda.Code.fromBucket(props.artifactsBucket, `${props.artifactKey}.zip`),
      timeout: props.timeout,
      memorySize: props.memorySize,
      logGroup,
      paramsAndSecrets,
    });

    this.function.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["ssm:GetParameter*"],
        resources: [
          cdk.Arn.format(
            { service: "ssm", resource: "parameter", resourceName: "tokistack/*" },
            cdk.Stack.of(this),
          ),
        ],
      }),
    );

    props.artifactsBucket.grantRead(this.function);
  }
}
