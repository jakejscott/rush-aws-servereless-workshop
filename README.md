# AWS Serverless Workshop

## Docs

1. Install the AWS CLI https://aws.amazon.com/cli/

2. Getting started with AWS CDK https://docs.aws.amazon.com/cdk/latest/guide/work-with.html

## Setup

🔥 Install the AWS CDK cli

```
yarn global add aws-cdk
```

🧶 Create a basic AWS CDK project

```
mkdir rush-aws-serverless-workshop
cd rush-aws-serverless-workshop
cdk init app --language typescript
yarn install
yarn build
```

💥 Delete the test folder and add a license to the package.json file

We won't be doing any tests, so lets just delete the test folder.

🏃‍♀️ Boostrap CDK

```
cdk bootstrap
 ⏳  Bootstrapping environment aws://817613107166/ap-southeast-2...
CDKToolkit: creating CloudFormation changeset...
 0/2 | 8:59:07 AM | UPDATE_IN_PROGRESS   | AWS::CloudFormation::Stack | CDKToolkit User Initiated
 0/2 | 8:59:11 AM | UPDATE_IN_PROGRESS   | AWS::S3::Bucket | StagingBucket
 1/2 | 8:59:32 AM | UPDATE_COMPLETE      | AWS::S3::Bucket | StagingBucket
 1/2 | 8:59:34 AM | UPDATE_COMPLETE_CLEA | AWS::CloudFormation::Stack | CDKToolkit
 2/2 | 8:59:34 AM | UPDATE_COMPLETE      | AWS::CloudFormation::Stack | CDKToolkit
 ✅  Environment aws://817613107166/ap-southeast-2 bootstrapped.
```

💣 Setup Github repository

```
git remote add origin git@github.com:jakejscott/rush-aws-serverelss-workshop.git
```

⌚ Compile typescript code in the background

```
yarn watch
```

## Let's start building our Stack!

🧶 We need to import the aws route53 cdk module.

```
yarn add @aws-cdk/aws-route53
```

🖊️ Lookup our hosted Zone and output the site and api urls for our stack.

```ts
// File: lib/aws-serverless-workshop-stack.ts

import * as cdk from "@aws-cdk/core";
import * as route53 from "@aws-cdk/aws-route53";

export interface AwsServerlessWorkshopStackProps extends cdk.StackProps {
  domainName: string;
  subdomain: string;
}

export class RushAwsServerelessWorkshopStack extends cdk.Stack {
  constructor(
    scope: cdk.Construct,
    id: string,
    props: AwsServerlessWorkshopStackProps
  ) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const zone = route53.HostedZone.fromLookup(this, "Zone", {
      domainName: props.domainName
    });

    const siteDomain = props.subdomain + "." + props.domainName;
    const apiDomain = "api." + props.subdomain + "." + props.domainName;

    const siteHttpsUrl = "https://" + siteDomain;
    const apiHttpsUrl = "https://" + apiDomain;

    new cdk.CfnOutput(this, "SiteUrl", { value: siteHttpsUrl });
    new cdk.CfnOutput(this, "ApiUrl", { value: apiHttpsUrl });
  }
}
```

🖊️ Edit the entrypoint for our cdk application

```ts
// File: bin/aws-serverless-workshop.ts

#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { RushAwsServerelessWorkshopStack } from '../lib/rush-aws-servereless-workshop-stack';

const app = new cdk.App();

new RushAwsServerelessWorkshopStack(app, 'RushAwsServerelessWorkshopStack-cool-dev1', {
                                              // PUT YOUR TEAM NAME HERE! ^^^^^^^^^
    env: {
        account: process.env.AWS_ACCOUNT_ID || '817613107166',
        region: process.env.AWS_DEFAULT_REGION || 'ap-southeast-2'
    },
    domainName: process.env.DOMAIN_NAME || 'jakejscott.com',
    subdomain: process.env.SUB_DOMAIN || 'cool-dev1' // <-- PUT YOUR TEAM NAME HERE!
});

```

🏃‍♀️ Synthesize and print out the Cloudformation stack

```sh
yarn build
cdk synthesize RushAwsServerelessWorkshopStack-cool-dev1 # <-- PUT YOUR TEAM NAME HERE!

Outputs:
  SiteUrl:
    Value: https://cool-dev1.jakejscott.com
  ApiUrl:
    Value: https://api.cool-dev1.jakejscott.com
Resources:
  CDKMetadata:
    Type: AWS::CDK::Metadata
    Properties:
      Modules: aws-cdk=1.23.0,@aws-cdk/aws-route53=1.23.0,@aws-cdk/core=1.23.0,@aws-cdk/cx-api=1.23.0,jsii-runtime=node.js/v12.16.0
```

🏃‍♀️ Deploy the stack to dev environment

```
yarn build
cdk deploy RushAwsServerelessWorkshopStack-cool-dev1 # <-- PUT YOUR TEAM NAME HERE!

RushAwsServerelessWorkshopStack-cool-dev1: deploying...
RushAwsServerelessWorkshopStack-cool-dev1: creating CloudFormation changeset...
 0/2 | 10:21:23 AM | CREATE_IN_PROGRESS   | AWS::CloudFormation::Stack | RushAwsServerelessWorkshopStack-cool-dev1 User Initiated
 0/2 | 10:21:27 AM | CREATE_IN_PROGRESS   | AWS::CDK::Metadata | CDKMetadata
 0/2 | 10:21:28 AM | CREATE_IN_PROGRESS   | AWS::CDK::Metadata | CDKMetadata Resource creation Initiated
 1/2 | 10:21:29 AM | CREATE_COMPLETE      | AWS::CDK::Metadata | CDKMetadata
 2/2 | 10:21:30 AM | CREATE_COMPLETE      | AWS::CloudFormation::Stack | RushAwsServerelessWorkshopStack-cool-dev1

 ✅  RushAwsServerelessWorkshopStack-cool-dev1

Outputs:
RushAwsServerelessWorkshopStack-cool-dev1.ApiUrl = https://api.cool-dev1.jakejscott.com
RushAwsServerelessWorkshopStack-cool-dev1.SiteUrl = https://cool-dev1.jakejscott.com

Stack ARN:
arn:aws:cloudformation:ap-southeast-2:817613107166:stack/RushAwsServerelessWorkshopStack-cool-dev1/9ae21380-4ddd-11ea-aae5-066f346b367c
```

## Creating a DynamoDB table!

🧶 We need to import the aws dynamodb cdk module.

```
yarn add '@aws-cdk/aws-dynamodb'
```

🖊️ Add dynamo db table to our stack, paste this below the line the existing code we had from previous step

```ts
// File: lib/aws-serverless-workshop-stack.ts

import * as cdk from "@aws-cdk/core";
import * as route53 from "@aws-cdk/aws-route53";
import * as dynamodb from "@aws-cdk/aws-dynamodb";

export interface AwsServerlessWorkshopStackProps extends cdk.StackProps {
  domainName: string;
  subdomain: string;
}

export class RushAwsServerelessWorkshopStack extends cdk.Stack {
  constructor(
    scope: cdk.Construct,
    id: string,
    props: AwsServerlessWorkshopStackProps
  ) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const zone = route53.HostedZone.fromLookup(this, "Zone", {
      domainName: props.domainName
    });

    const siteDomain = props.subdomain + "." + props.domainName;
    const apiDomain = "api." + props.subdomain + "." + props.domainName;

    const siteHttpsUrl = "https://" + siteDomain;
    const apiHttpsUrl = "https://" + apiDomain;

    new cdk.CfnOutput(this, "SiteUrl", { value: siteHttpsUrl });
    new cdk.CfnOutput(this, "ApiUrl", { value: apiHttpsUrl });

    const contactsTable = new dynamodb.Table(this, "ContactsTable", {
      partitionKey: {
        name: "pk",
        type: dynamodb.AttributeType.STRING
      },
      sortKey: {
        name: "sk",
        type: dynamodb.AttributeType.STRING
      },
      tableName: props.subdomain + "-contacts",
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });
  }
}
```

🏃‍♀️ Deploy the stack to dev environment

```
yarn build
cdk deploy RushAwsServerelessWorkshopStack-cool-dev1
```

## Create a Lambda to process the contact form

🧶 We need to import the aws lambda cdk module.

```
yarn add '@aws-cdk/aws-lambda'
```

🖊️ Add the contact form lambda to the stack

```ts
// File: lib/aws-serverless-workshop-stack.ts

import * as cdk from "@aws-cdk/core";
import * as route53 from "@aws-cdk/aws-route53";
import * as dynamodb from "@aws-cdk/aws-dynamodb";
import * as lambda from "@aws-cdk/aws-lambda";

export interface AwsServerlessWorkshopStackProps extends cdk.StackProps {
  domainName: string;
  subdomain: string;
}

export class RushAwsServerelessWorkshopStack extends cdk.Stack {
  constructor(
    scope: cdk.Construct,
    id: string,
    props: AwsServerlessWorkshopStackProps
  ) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const zone = route53.HostedZone.fromLookup(this, "Zone", {
      domainName: props.domainName
    });

    const siteDomain = props.subdomain + "." + props.domainName;
    const apiDomain = "api." + props.subdomain + "." + props.domainName;

    const siteHttpsUrl = "https://" + siteDomain;
    const apiHttpsUrl = "https://" + apiDomain;

    new cdk.CfnOutput(this, "SiteUrl", { value: siteHttpsUrl });
    new cdk.CfnOutput(this, "ApiUrl", { value: apiHttpsUrl });

    //
    // Backend
    //

    // Contacts DynamoDB table
    const contactsTable = new dynamodb.Table(this, "ContactsTable", {
      partitionKey: {
        name: "pk",
        type: dynamodb.AttributeType.STRING
      },
      sortKey: {
        name: "sk",
        type: dynamodb.AttributeType.STRING
      },
      tableName: props.subdomain + "-contacts",
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    // Contact form Lambda
    const createContactLambda = new lambda.Function(
      this,
      "CreateContactLambda",
      {
        code: new lambda.AssetCode("backend/create-contact"),
        handler: "index.handler",
        runtime: lambda.Runtime.NODEJS_10_X,
        environment: {
          TABLE_NAME: contactsTable.tableName,
          ORIGIN_URL: siteHttpsUrl
        },
        memorySize: 3004,
        timeout: cdk.Duration.seconds(10)
      }
    );

    // Grant the Contact form lambda read and write permissions to the DynamoDB table.
    contactsTable.grantReadWriteData(createContactLambda);
  }
}
```

🏃‍♀️ Deploy the Lambda to dev

```
yarn build
cdk deploy RushAwsServerelessWorkshopStack-cool-dev1
```

## Create a certificate for our API using Amazon certificate manager

🧶 We need to import the acm cdk module.

```
yarn add @aws-cdk/aws-certificatemanager
```

🖊️ Create a DNS validated certificate

```ts
// File: lib/aws-serverless-workshop-stack.ts
import * as acm from "@aws-cdk/aws-certificatemanager";

// API Certificate
const apiCertificate = new acm.DnsValidatedCertificate(this, "ApiCertificate", {
  domainName: apiDomain,
  hostedZone: zone
});

new cdk.CfnOutput(this, "ApiCertificateArn", {
  value: apiCertificate.certificateArn
});
```

🏃‍♀️ Deploy the api cert to dev

```
yarn build
cdk deploy RushAwsServerelessWorkshopStack-cool-dev1
```

## Create an API Gateway to expose our contact lambda.

🧶 We need to import the api gateway cdk module

```
yarn add @aws-cdk/aws-apigateway
```

🖊️ Create an API Gateway

```ts
// File: lib/aws-serverless-workshop-stack.ts
import * as apigateway from "@aws-cdk/aws-apigateway";

// API Gateway
const api = new apigateway.RestApi(this, "ContactsApi", {
  restApiName: props.subdomain + "-contacts-api",
  defaultCorsPreflightOptions: {
    allowOrigins: [siteHttpsUrl],
    allowMethods: ["*"],
    allowHeaders: ["*"]
  },
  domainName: {
    certificate: apiCertificate,
    domainName: apiDomain
  }
});

const contactsResource = api.root.addResource("contacts");
contactsResource.addMethod(
  "POST",
  new apigateway.LambdaIntegration(createContactLambda)
);
```

🏃‍♀️ Deploy the api gateway to dev

```
yarn build
cdk deploy RushAwsServerelessWorkshopStack-cool-dev1
```

## Create a DNS record in Route53 to point to API Gateway

🧶 We need to import the route53-targets cdk module

```
yarn add @aws-cdk/aws-route53-targets
```

🖊️ Create an address record in Route53 aliasing to API Gateway endpoint

```ts
// File: lib/aws-serverless-workshop-stack.ts
import * as targets from "@aws-cdk/aws-route53-targets/lib";

// Route53 alias record for the CloudFront distribution
new route53.ARecord(this, "ApiAliasRecord", {
  recordName: apiDomain,
  target: route53.AddressRecordTarget.fromAlias(new targets.ApiGateway(api)),
  zone: zone
});
```

🏃‍♀️ Deploy the DNS change to dev

```
yarn build
cdk deploy RushAwsServerelessWorkshopStack-cool-dev1
```

## Hosting a static website using S3

🧶 We need to import the aws s3 cdk module

```
yarn add @aws-cdk/aws-s3
```

🖊️ Create an bucket that we will use to host the static content

```ts
// File: lib/aws-serverless-workshop-stack.ts

// Content bucket
const siteBucket = new s3.Bucket(this, "SiteBucket", {
  bucketName: siteDomain,
  websiteIndexDocument: "index.html",
  websiteErrorDocument: "error.html",
  publicReadAccess: true,
  removalPolicy: cdk.RemovalPolicy.DESTROY
});
new cdk.CfnOutput(this, "Bucket", { value: siteBucket.bucketName });
```

🏃‍♀️ Deploy the content bucket to dev

```
yarn build
cdk deploy RushAwsServerelessWorkshopStack-cool-dev1
```

## Create a certificate for our site

🖊️ Create a DNS validated certificate

```ts
// File: lib/aws-serverless-workshop-stack.ts

// TLS certificate for the website
const siteCertificate = new acm.DnsValidatedCertificate(
  this,
  "SiteCertificate",
  {
    domainName: siteDomain,
    hostedZone: zone,
    region: "us-east-1"
  }
);
new cdk.CfnOutput(this, "SiteCertificateArn", {
  value: siteCertificate.certificateArn
});
```

🏃‍♀️ Deploy the site cert to dev

```
yarn build
cdk deploy RushAwsServerelessWorkshopStack-cool-dev1
```

## Create a Cloudfront distribution for our site

🧶 We need to import the aws cloudfront cdk module

```
 yarn add @aws-cdk/aws-cloudfront
```

🖊️ Create a Cloudfront distribution

```ts
// File: lib/aws-serverless-workshop-stack.ts

// CloudFront distribution that provides HTTPS
const distribution = new cloudfront.CloudFrontWebDistribution(
  this,
  "SiteDistribution",
  {
    aliasConfiguration: {
      acmCertRef: siteCertificate.certificateArn,
      names: [siteDomain],
      sslMethod: cloudfront.SSLMethod.SNI,
      securityPolicy: cloudfront.SecurityPolicyProtocol.TLS_V1_1_2016
    },
    originConfigs: [
      {
        s3OriginSource: {
          s3BucketSource: siteBucket
        },
        behaviors: [{ isDefaultBehavior: true }]
      }
    ]
  }
);
new cdk.CfnOutput(this, "DistributionId", {
  value: distribution.distributionId
});
```

## Create a DNS record for our site

🖊️ Create a DNS record which is an alias to the cloudfront endpoint

```ts
// Route53 alias record for the CloudFront distribution
new route53.ARecord(this, "SiteAliasRecord", {
  recordName: siteDomain,
  target: route53.AddressRecordTarget.fromAlias(
    new targets.CloudFrontTarget(distribution)
  ),
  zone: zone
});
```

## Upload our React app to S3 Bucket

🧶 We need to import the aws s3 deployment cdk module

```
yarn add @aws-cdk/aws-s3-deployment
```

🔥🔥🔥 We need to edit the `REACT_APP_API_HTTPS_URL` environment variable in the frontend to point to our API endpoint

```
./frontend/.env
```

💰💰💰 Build the React app 💰💰💰

```
cd frontend
yarn install
yarn build
```

🖊️ Create a bucket deployment

```ts
// Deploy site contents to S3 bucket
new s3deploy.BucketDeployment(this, "DeployWithInvalidation", {
  sources: [s3deploy.Source.asset("./frontend/build")],
  destinationBucket: siteBucket,
  distribution,
  distributionPaths: ["/*"]
});
```

🏃‍♀️ Deploy the site!

```
yarn build
cdk deploy RushAwsServerelessWorkshopStack-cool-dev1
```
