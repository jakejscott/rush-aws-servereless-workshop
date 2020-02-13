import * as cdk from '@aws-cdk/core';
import * as route53 from '@aws-cdk/aws-route53';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import * as acm from '@aws-cdk/aws-certificatemanager';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as targets from '@aws-cdk/aws-route53-targets/lib';
import * as s3 from '@aws-cdk/aws-s3';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as s3deploy from '@aws-cdk/aws-s3-deployment';

export interface AwsServerlessWorkshopStackProps extends cdk.StackProps {
  domainName: string;
  subdomain: string;
}

export class RushAwsServerelessWorkshopStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: AwsServerlessWorkshopStackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    const zone = route53.HostedZone.fromLookup(this, 'Zone', { domainName: props.domainName });

    const siteDomain = props.subdomain + '.' + props.domainName;
    const apiDomain = 'api.' + props.subdomain + '.' + props.domainName;

    const siteHttpsUrl = 'https://' + siteDomain;
    const apiHttpsUrl = 'https://' + apiDomain;

    new cdk.CfnOutput(this, 'SiteUrl', { value: siteHttpsUrl });
    new cdk.CfnOutput(this, 'ApiUrl', { value: apiHttpsUrl });

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
    const createContactLambda = new lambda.Function(this, 'CreateContactLambda', {
      code: new lambda.AssetCode('backend/create-contact'),
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_10_X,
      environment: {
        TABLE_NAME: contactsTable.tableName,
        ORIGIN_URL: siteHttpsUrl
      },
      memorySize: 3004,
      timeout: cdk.Duration.seconds(10)
    });

    // Grant the Contact form lambda read and write permissions to the DynamoDB table.
    contactsTable.grantReadWriteData(createContactLambda);

    // API Certificate
    const apiCertificate = new acm.DnsValidatedCertificate(this, 'ApiCertificate', {
      domainName: apiDomain,
      hostedZone: zone
    });
    new cdk.CfnOutput(this, 'ApiCertificateArn', { value: apiCertificate.certificateArn });

    // API Gateway
    const api = new apigateway.RestApi(this, 'ContactsApi', {
      restApiName: props.subdomain + "-contacts-api",
      defaultCorsPreflightOptions: {
        allowOrigins: [siteHttpsUrl],
        allowMethods: ["*"],
        allowHeaders: ["*"],
      },
      domainName: {
        certificate: apiCertificate,
        domainName: apiDomain
      }
    });

    const contactsResource = api.root.addResource('contacts');
    contactsResource.addMethod('POST', new apigateway.LambdaIntegration(createContactLambda));

    // Route53 alias record to the API Gateway
    new route53.ARecord(this, "ApiAliasRecord", {
      recordName: apiDomain,
      target: route53.AddressRecordTarget.fromAlias(new targets.ApiGateway(api)),
      zone: zone
    });

    //
    // Frontend
    //

    // Content bucket
    const siteBucket = new s3.Bucket(this, 'SiteBucket', {
      bucketName: siteDomain,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'error.html',
      publicReadAccess: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });
    new cdk.CfnOutput(this, 'Bucket', { value: siteBucket.bucketName });

    // TLS certificate for the website
    const siteCertificate = new acm.DnsValidatedCertificate(this, 'SiteCertificate', {
      domainName: siteDomain,
      hostedZone: zone,
      region: 'us-east-1'
    });
    new cdk.CfnOutput(this, 'SiteCertificateArn', { value: siteCertificate.certificateArn });

    // CloudFront distribution that provides HTTPS
    const distribution = new cloudfront.CloudFrontWebDistribution(this, 'SiteDistribution', {
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
    });
    new cdk.CfnOutput(this, 'DistributionId', { value: distribution.distributionId });

    // Route53 alias record for the CloudFront distribution
    new route53.ARecord(this, 'SiteAliasRecord', {
      recordName: siteDomain,
      target: route53.AddressRecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
      zone: zone
    });

    // Deploy site contents to S3 bucket
    new s3deploy.BucketDeployment(this, 'DeployWithInvalidation', {
      sources: [s3deploy.Source.asset('./frontend/build')],
      destinationBucket: siteBucket,
      distribution,
      distributionPaths: ['/*'],
    });

  }
}
