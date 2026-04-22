import { HttpApi, HttpStage } from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaAuthorizer, HttpLambdaResponseType } from "aws-cdk-lib/aws-apigatewayv2-authorizers";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";
import { TokistackFunction } from "../constructs/tokistack-function";

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

    const apiFunction = new TokistackFunction(this, "ApiFunction", {
      clusterName: props.clusterName,
      name: "api",
      runtime: lambda.Runtime.NODEJS_24_X,
      memorySize: 512,
      timeout: cdk.Duration.seconds(15),
      artifactsBucket,
      artifactKey: `${hashOrVersion.valueAsString}/api`,
    });

    const authorizerFunction = new TokistackFunction(this, "AuthorizerFunction", {
      clusterName: props.clusterName,
      name: "authorizer",
      runtime: lambda.Runtime.NODEJS_24_X,
      memorySize: 128,
      timeout: cdk.Duration.seconds(5),
      artifactsBucket,
      artifactKey: `${hashOrVersion.valueAsString}/authorizer`,
    });

    const authFunction = new TokistackFunction(this, "AuthFunction", {
      clusterName: props.clusterName,
      name: "auth",
      runtime: lambda.Runtime.NODEJS_24_X,
      memorySize: 256,
      timeout: cdk.Duration.seconds(15),
      artifactsBucket,
      artifactKey: `${hashOrVersion.valueAsString}/auth`,
    });

    authFunction.function.addEnvironment("CLUSTER_NAME", props.clusterName);

    const authorizer = new HttpLambdaAuthorizer("Authorizer", authorizerFunction.function, {
      responseTypes: [HttpLambdaResponseType.SIMPLE],
    });

    const apiIntegration = new HttpLambdaIntegration("ApiIntegration", apiFunction.function);
    const authIntegration = new HttpLambdaIntegration("AuthIntegration", authFunction.function);

    const httpApi = new HttpApi(this, "HttpApi", {
      apiName: `tokistack-${props.clusterName}-api`,
      createDefaultStage: false,
    });

    httpApi.addRoutes({
      path: "/api/auth/{proxy+}",
      integration: authIntegration,
    });

    httpApi.addRoutes({
      path: "/api/waitlist/{proxy+}",
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
