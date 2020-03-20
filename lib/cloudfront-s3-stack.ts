import { App, Stack, StackProps } from '@aws-cdk/core';
import { CloudFrontWebDistribution, OriginAccessIdentity } from '@aws-cdk/aws-cloudfront';
import { Bucket, BucketPolicy } from '@aws-cdk/aws-s3';
import { PolicyStatement } from '@aws-cdk/aws-iam';

export class CloudfrontS3Stack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create bucket (which is not a static website host), encrypted AES-256 and block all public access
    // Only Cloudfront access to S3 bucket
    // const testBucket = new Bucket(this, 'TestS3Bucket', {
    //   encryption: BucketEncryption.S3_MANAGED,
    //   bucketName: 'cdk-static-asset-dmahapatro',
    //   blockPublicAccess: BlockPublicAccess.BLOCK_ALL
    // });

    const testBucket = Bucket.fromBucketName(this, 'TestBucket', 'dmahapatro-personal-bucket');
    
    // Create Origin Access Identity to be use Canonical User Id in S3 bucket policy
    const originAccessIdentity = new OriginAccessIdentity(this, 'OAI', {
      comment: "Created_by_dmahapatro"
    });

    // This does not seem to work if Bucket.fromBucketName is used
    // It works for S3 buckets which are created as part of this stack
    // testBucket.grantRead(originAccessIdentity);

    // Explicitly add Bucket Policy 
    const policyStatement = new PolicyStatement();
    policyStatement.addActions('s3:GetBucket*');
    policyStatement.addActions('s3:GetObject*');
    policyStatement.addActions('s3:List*');
    policyStatement.addResources(testBucket.bucketArn);
    policyStatement.addResources(`${testBucket.bucketArn}/*`);
    policyStatement.addCanonicalUserPrincipal(originAccessIdentity.cloudFrontOriginAccessIdentityS3CanonicalUserId);

    // testBucket.addToResourcePolicy(policyStatement);

    if( !testBucket.policy ) {
      new BucketPolicy(this, 'Policy', { bucket: testBucket }).document.addStatements(policyStatement);
    } else {
      testBucket.policy.document.addStatements(policyStatement);
    }

    // Create Cloudfront distribution with S3 as Origin
    const distribution = new CloudFrontWebDistribution(this, 'cdk-example-distribution', {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: testBucket,
            originAccessIdentity: originAccessIdentity
          },
          behaviors: [
            { isDefaultBehavior: true }
          ]
        }
      ]
    });

    // Upload items in bucket and provide distribution to create invalidations
    // new BucketDeployment(this, 'DeployWebsite', {
    //   sources: [Source.asset('dist')],
    //   destinationBucket: testBucket,
    //   distribution,
    //   distributionPaths: ['/images/*.png']
    // });
  }
}
