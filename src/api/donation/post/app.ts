import AWS from 'aws-sdk';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { insertDonation } from '../../../lib/simpledb/donations';
import { Donation } from '../../../lib/types/donation';
import { createResponseBody } from '../../lib/response';
import { validateDonation } from '../../lib/validate';
import { generateIdentifier } from '../../../lib/identifier';

const notifyNewDonationReceived = async (donation: Donation): Promise<void> => {
  const params = {
    TopicArn: process.env.NEW_DONATION_TOPIC,
    Message: JSON.stringify({ donationId: donation.donationId }),
  };

  const sns = new AWS.SNS({ region: process.env.TARGET_REGION });
  await sns.publish(params).promise();
};

export const lambdaHandler: APIGatewayProxyHandler = async (event) => {
  try {
    const donation: Donation = JSON.parse(event.body ?? '{}');
    donation.donationId = generateIdentifier();

    const { valid, errors } = validateDonation(donation);
    if (!valid) {
      return createResponseBody(400, { message: errors });
    }

    await insertDonation(donation);

    await notifyNewDonationReceived(donation);

    const response = createResponseBody(200, donation);
    return response;
  } catch (err) {
    console.log(err);
    return createResponseBody(500, { message: 'Go look at the logs...' });
  }
};
