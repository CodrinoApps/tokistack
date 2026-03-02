import { HttpApi, HttpStage } from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaAuthorizer, HttpLambdaResponseType } from "aws-cdk-lib/aws-apigatewayv2-authorizers";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as logs from "aws-cdk-lib/aws-logs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";

interface ApiStackProps extends cdk.StackProps {
  clusterName: string;
}

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
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

    const logGroup = new logs.LogGroup(this, "ApiFunctionLogs", {
      logGroupName: `/aws/lambda/tokistack-${props.clusterName}-api`,
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const apiFunction = new lambda.Function(this, "ApiFunction", {
      functionName: `tokistack-${props.clusterName}-api`,
      runtime: lambda.Runtime.NODEJS_24_X,
      architecture: lambda.Architecture.ARM_64,
      handler: "index.handler",
      code: lambda.Code.fromBucket(
        artifactsBucket,
        `${hashOrVersion.valueAsString}/api.zip`,
      ),
      timeout: cdk.Duration.seconds(15),
      memorySize: 512,
      logGroup,
    });

    artifactsBucket.grantRead(apiFunction);

    const authorizerLogGroup = new logs.LogGroup(this, "AuthorizerFunctionLogs", {
      logGroupName: `/aws/lambda/tokistack-${props.clusterName}-authorizer`,
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const authorizerFunction = new lambda.Function(this, "AuthorizerFunction", {
      functionName: `tokistack-${props.clusterName}-authorizer`,
      runtime: lambda.Runtime.NODEJS_24_X,
      architecture: lambda.Architecture.ARM_64,
      handler: "index.handler",
      code: lambda.Code.fromBucket(
        artifactsBucket,
        `${hashOrVersion.valueAsString}/authorizer.zip`,
      ),
      timeout: cdk.Duration.seconds(5),
      memorySize: 128,
      logGroup: authorizerLogGroup,
    });

    artifactsBucket.grantRead(authorizerFunction);

    const authorizer = new HttpLambdaAuthorizer("Authorizer", authorizerFunction, {
      responseTypes: [HttpLambdaResponseType.SIMPLE],
    });

    const apiIntegration = new HttpLambdaIntegration("ApiIntegration", apiFunction);

    const httpApi = new HttpApi(this, "HttpApi", {
      apiName: `tokistack-${props.clusterName}-api`,
      createDefaultStage: false,
    });

    httpApi.addRoutes({
      path: "/api/auth/{proxy+}",
      integration: apiIntegration,
    });

    httpApi.addRoutes({
      path: "/{proxy+}",
      authorizer,
      integration: apiIntegration,
    });

    new HttpStage(this, "DefaultStage", {
      httpApi,
      stageName: "$default",
      autoDeploy: true,
      throttle: {
        burstLimit: 50,
        rateLimit: 25,
      },
    });
  }
}
