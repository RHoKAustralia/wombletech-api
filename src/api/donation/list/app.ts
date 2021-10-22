import { APIGatewayProxyHandler } from 'aws-lambda';
import { QueryParams } from '../../lib/types';
import { createResponseBody } from '../../lib/response';
import { readDonations } from '../../../lib/simpledb/donations';
import { decode, encode } from '../../../lib/encoding';

export const lambdaHandler: APIGatewayProxyHandler = async (event) => {
  try {
    const query = event.queryStringParameters as QueryParams;
    const { limit, ascending, cursor } = { ...query };

    const { items, next } = await readDonations(limit, ascending, decode(cursor));

    const response = createResponseBody(200, { items: items, cursor: encode(next) || null });
    return response;
  } catch (err) {
    console.log(err);
    return createResponseBody(500, { message: 'Go look at the logs...' });
  }
};
