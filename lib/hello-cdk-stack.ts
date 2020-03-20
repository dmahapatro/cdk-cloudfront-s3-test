import { App, Stack, StackProps } from '@aws-cdk/core';
import { BucketDeployment, Source } from '@aws-cdk/aws-s3-deployment';
import { CloudFrontWebDistribution, OriginAccessIdentity } from '@aws-cdk/aws-cloudfront';
import { BlockPublicAccess, Bucket, BucketEncryption } from '@aws-cdk/aws-s3';

export class HelloCdkStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    const myFirstBucket = new Bucket(this, 'MyFirstBucket', {
      versioned: true,
      encryption: BucketEncryption.S3_MANAGED,
      bucketName: 'cdk-example-dmahapatro',
      websiteIndexDocument: 'index.html',
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL
    });

    new BucketDeployment(this, 'DeployWebsite', {
      sources: [Source.asset('dist')],
      destinationBucket: myFirstBucket
    });

    const oia = new OriginAccessIdentity(this, 'OIA', {
      comment: "Created by CDK"
    });
    myFirstBucket.grantRead(oia);

    new CloudFrontWebDistribution(this, 'cdk-example-distribution', {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: myFirstBucket,
            originAccessIdentity: oia
          },
          behaviors: [
            { isDefaultBehavior: true }
          ]
        }
      ]
    });
  }
}
