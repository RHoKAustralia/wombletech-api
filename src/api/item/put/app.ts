import { APIGatewayProxyHandler } from 'aws-lambda';
import { Item } from '../../../lib/types/item';
import { createResponseBody } from '../../lib/response';
import { validateItem } from '../../lib/validate';
import { updateDonatedItem, itemExists } from '../../../lib/simpledb';

export const lambdaHandler: APIGatewayProxyHandler = async (event) => {
  try {
    const { donationId: id } = event.pathParameters as { donationId: string };
    const item: Item = JSON.parse(event.body ?? '{}');
    item.donationId = id;

    const { valid, errors } = validateItem(item);
    if (!valid) {
      return createResponseBody(400, { message: errors });
    }

    const exists = await itemExists(item.donationId, item.itemId);
    if (!exists) {
      return createResponseBody(404, {});
    }

    await updateDonatedItem(item);

    const { ...attributes } = { ...item };
    const response = createResponseBody(200, attributes);
    return response;
  } catch (err) {
    console.log(err);
    return createResponseBody(500, { message: 'Go look at the logs...' });
  }
};
