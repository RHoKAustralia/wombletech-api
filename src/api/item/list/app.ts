import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { createResponseBody } from '../../lib/response';
import { readDonatedItems } from '../../../lib/simpledb/items';

export const lambdaHandler = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const { id } = event.pathParameters as { id: string };

    const { items } = await readDonatedItems(id);

    const response = createResponseBody(200, { item: items });
    return response;
  } catch (err) {
    console.log(err);
    return createResponseBody(500, { message: 'Go look at the logs...' });
  }
};