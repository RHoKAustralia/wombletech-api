import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { createResponseBody } from '../../lib/response';
import { getDonation } from '../../../lib/simpledb/donations';

export const lambdaHandler = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const { donationId } = event.pathParameters as { donationId: string };
    const donation = await getDonation(donationId);

    if (!donation) {
      return createResponseBody(404, {});
    }

    const response = createResponseBody(200, donation);
    return response;
  } catch (err) {
    console.log(err);
    return createResponseBody(500, { message: 'Go look at the logs...' });
  }
};
