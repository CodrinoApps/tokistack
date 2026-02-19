import * as s3 from "aws-cdk-lib/aws-s3";
import * as cdk from "aws-cdk-lib/core";
import { Construct } from "constructs";

interface ArtifactsStackProps extends cdk.StackProps {
  clusterName: string;
}

export class ArtifactsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ArtifactsStackProps) {
    super(scope, id, props);

    new s3.Bucket(this, "ArtifactsBucket", {
      bucketName: `tokistack-${props.clusterName}-artifacts`,
      versioned: false,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      lifecycleRules: [{
        id: "expire-old-artifacts",
        enabled: true,
        expiration: cdk.Duration.days(90),
      }],
    });
  }
}
