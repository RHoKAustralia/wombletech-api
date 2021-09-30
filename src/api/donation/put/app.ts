import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { updateDonation } from '../../../lib/database/donations';
import { Donation } from '../../../lib/types/donation';
import { createResponseBody } from '../../lib/response';
import { validateDonation } from '../../lib/validate';

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
  _context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const donation: Donation = JSON.parse(event.body ?? '{}');

    const { valid, errors } = validateDonation(donation);
    if (!valid) {
      return createResponseBody(400, { message: errors });
    }

    await updateDonation(donation);

    const response = createResponseBody(200, donation);
    return response;
  } catch (err) {
    console.log(err);
    return createResponseBody(500, { message: 'Go look at the logs...' });
  }
};
