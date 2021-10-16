import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { Item } from '../../../lib/types/item';
import { createResponseBody } from '../../lib/response';
import { validateItem } from '../../lib/validate';
import { updateDonatedItem } from '../../../lib/simpledb/items';

export const lambdaHandler = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const { donationId: id } = event.pathParameters as { donationId: string };
    const item: Item = JSON.parse(event.body ?? '{}');
    item.donationId = id;

    const { valid, errors } = validateItem(item);
    if (!valid) {
      return createResponseBody(400, { message: errors });
    }

    await updateDonatedItem(item);

    const { donationId, ...attributes } = { ...item };
    const response = createResponseBody(200, attributes);
    return response;
  } catch (err) {
    console.log(err);
    return createResponseBody(500, { message: 'Go look at the logs...' });
  }
};
