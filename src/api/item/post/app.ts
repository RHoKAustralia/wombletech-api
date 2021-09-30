import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { createResponseBody } from '../../lib/response';
import { validateItem } from '../../lib/validate';
import { Item } from '../../../lib/types/item';
import { donationExists } from '../../../lib/database/donations';
import { insertDonatedItem } from '../../../lib/database/items';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { v4: uuidv4 } = require('uuid');

exports.lambdaHandler = async (
  event: APIGatewayProxyEvent,
  _context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const { id } = event.pathParameters as { id: string };

    const item: Item = JSON.parse(event.body ?? '{}');
    item.itemId = uuidv4().toString();
    item.donationId = id;

    const { valid, errors } = validateItem(item);
    if (!valid) {
      return createResponseBody(400, { message: errors });
    }

    const exists = await donationExists(item.donationId);
    if (!exists) {
      const response = createResponseBody(400, { message: 'Header record does not exist' });
      return response;
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
