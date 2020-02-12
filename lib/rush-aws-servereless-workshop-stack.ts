import * as cdk from '@aws-cdk/core';
import * as route53 from '@aws-cdk/aws-route53';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';

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


  }
}
