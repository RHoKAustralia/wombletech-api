import { APIGatewayProxyHandler } from 'aws-lambda';
import { createResponseBody } from '../../lib/response';
import { getItem } from '../../../lib/simpledb';

export const lambdaHandler: APIGatewayProxyHandler = async (event) => {
  try {
    const { donationId, itemId } = event.pathParameters as { donationId: string; itemId: string };

    const item = await getItem(donationId, itemId);
    if (!item) {
      return createResponseBody(404, {});
    }

    const response = createResponseBody(200, item);
    return response;
  } catch (err) {
    console.log(err);
    return createResponseBody(500, { message: 'Go look at the logs...' });
  }
};
