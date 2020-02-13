#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { RushAwsServerelessWorkshopStack } from '../lib/rush-aws-serverless-workshop-stack';

const app = new cdk.App();

new RushAwsServerelessWorkshopStack(app, 'RushAwsServerelessWorkshopStack-cool-dev1', {
    env: {
        account: process.env.AWS_ACCOUNT_ID || '817613107166',
        region: process.env.AWS_DEFAULT_REGION || 'ap-southeast-2'
    },
    domainName: process.env.DOMAIN_NAME || 'jakejscott.com',
    subdomain: process.env.SUB_DOMAIN || 'cool-dev1'
});