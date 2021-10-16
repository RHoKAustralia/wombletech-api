import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { createResponseBody } from '../../lib/response';
import { validateItem } from '../../lib/validate';
import { Item } from '../../../lib/types/item';
import { insertDonatedItem, donationExists } from '../../../lib/simpledb';
import { generateIdentifier } from '../../../lib/identifier';

export const lambdaHandler = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const { donationId: id } = event.pathParameters as { donationId: string };

    const item: Item = JSON.parse(event.body ?? '{}');
    item.itemId = generateIdentifier();
    item.donationId = id;

    const { valid, errors } = validateItem(item);
    if (!valid) {
      return createResponseBody(400, { message: errors });
    }

    const exists = await donationExists(item.donationId);
    if (!exists) {
      return createResponseBody(404, {});
    }

    await insertDonatedItem(item);

    const { donationId, ...attributes } = item;
    const response = createResponseBody(200, attributes);
    return response;
  } catch (err) {
    console.log(err);
    return createResponseBody(500, { message: 'Go look at the logs...' });
  }
};
