import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { DonationQueryCursor } from '../../../lib/types/donation';
import { QueryParams } from '../../lib/types';
import { createResponseBody } from '../../lib/response';
import { decode } from '../../../lib/encoding';
import { readDonations } from '../../../lib/database/donations';

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */
exports.lambdaHandler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const query = event.queryStringParameters as QueryParams;
    const { limit, ascending, cursor } = { ...query };

    const startKey = (cursor ? JSON.parse(decode(cursor)) : null) as DonationQueryCursor;
    const { donations, newCursor } = await readDonations(limit, ascending, startKey);

    const response = createResponseBody(200, { items: donations ?? [], cursor: newCursor });
    return response;
  } catch (err) {
    console.log(err);
    return createResponseBody(500, { message: 'Go look at the logs...' });
  }
};
