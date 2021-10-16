import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { createResponseBody } from '../../lib/response';
import { readDonatedItems } from '../../../lib/simpledb/items';

export const lambdaHandler = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const { donationId } = event.pathParameters as { donationId: string };

    const { items } = await readDonatedItems(donationId);

    const response = createResponseBody(200, { item: items });
    return response;
  } catch (err) {
    console.log(err);
    return createResponseBody(500, { message: 'Go look at the logs...' });
  }
};
