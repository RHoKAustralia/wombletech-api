import { APIGatewayProxyHandler } from 'aws-lambda';
import { createResponseBody } from '../../lib/response';
import { donationExists, readDonatedItems } from '../../../lib/simpledb';

export const lambdaHandler: APIGatewayProxyHandler = async (event) => {
  try {
    const { donationId } = event.pathParameters as { donationId: string };

    const exists = await donationExists(donationId);
    if (!exists) {
      return createResponseBody(404, {});
    }

    const { items } = await readDonatedItems(donationId);

    const response = createResponseBody(200, { item: items });
    return response;
  } catch (err) {
    console.log(err);
    return createResponseBody(500, { message: 'Go look at the logs...' });
  }
};
