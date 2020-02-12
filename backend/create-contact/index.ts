import * as AWS from 'aws-sdk';
const ddb = new AWS.DynamoDB.DocumentClient();

const TABLE_NAME = process.env.TABLE_NAME || '';
const ORIGIN_URL = process.env.ORIGIN_URL || '*';

function error(statusCode: number, error: string) {
    return {
        statusCode: statusCode,
        body: JSON.stringify({ error: error }),
        headers: {
            'Access-Control-Allow-Origin': ORIGIN_URL
        }
    };
}

function ok(statusCode: number, body: any) {
    return {
        statusCode: statusCode,
        body: JSON.stringify(body),
        headers: {
            'Access-Control-Allow-Origin': ORIGIN_URL
        }
    };
}

export const handler = async (event: any = {}): Promise<any> => {
    console.log('event:', event);

    if (!event.body) {
        return error(400, 'request body is required');
    }

    const contact = JSON.parse(event.body);
    if (!contact.email) {
        return error(400, 'email is required');
    }

    if (!contact.name) {
        return error(400, 'name is required');
    }

    if (!contact.message) {
        return error(400, 'message is required');
    }

    if (!contact.company) {
        return error(400, 'company is required');
    }

    const item = {
        pk: contact.email,
        sk: new Date().toISOString(),
        name: contact.name,
        company: contact.company,
        message: contact.message
    };

    const params = {
        TableName: TABLE_NAME,
        Item: item
    };

    try {
        await ddb.put(params).promise();
        return ok(200, {});
    } catch (dbError) {
        console.error('ddb error: ', dbError);
        return error(500, 'internal server error');
    }
};