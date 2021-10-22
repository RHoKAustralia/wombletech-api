import { APIGatewayProxyHandler } from 'aws-lambda';
import { updateDonation } from '../../../lib/simpledb/donations';
import { Donation } from '../../../lib/types/donation';
import { createResponseBody } from '../../lib/response';
import { validateDonation } from '../../lib/validate';

export const lambdaHandler: APIGatewayProxyHandler = async (event) => {
  try {
    const donation: Donation = JSON.parse(event.body ?? '{}');

    const { valid, errors } = validateDonation(donation);
    if (!valid) {
      return createResponseBody(400, { message: errors });
    }

    await updateDonation(donation);

    const response = createResponseBody(200, donation);
    return response;
  } catch (err) {
    console.log(err);
    return createResponseBody(500, { message: 'Go look at the logs...' });
  }
};
