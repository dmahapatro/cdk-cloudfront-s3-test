#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { HelloCdkStack } from '../lib/hello-cdk-stack';
import { CloudfrontS3Stack } from '../lib/cloudfront-s3-stack';

const app = new cdk.App();
new HelloCdkStack(app, 'HelloCdkStack');
new CloudfrontS3Stack(app, 'CloudfrontS3Stack');