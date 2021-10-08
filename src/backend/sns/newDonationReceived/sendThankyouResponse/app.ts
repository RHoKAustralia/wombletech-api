import AWS from 'aws-sdk';
import { SNSHandler } from 'aws-lambda';
import { getDonation } from '../../../../lib/simpledb/donations';
import { Donation } from '../../../../lib/types/donation';

const mxDomain = process.env.MX_DOMAIN;

const sendThankyouEmail = async (donation: Donation): Promise<void> => {
  const params = {
    Destination: {
      ToAddresses: [donation.email],
    },
    Message: {
      Body: {
        Text: {
          Data: 'Hi\n\nWe have received your donation request and our volunteers will be reviewing it shortly.\n\nOnce reviewed, our volunteers will contact you regrarding your donation and, if acceptable, to arrange collection.\n\nThank you again for your generous offer.\n\nThe Wombletech Team',
        },
      },
      Subject: {
        Data: `We have received your donation request. (Ref: ${donation.donationId})`,
      },
    },
    Source: `donations@${mxDomain}`,
  };

  const ses = new AWS.SES({ region: process.env.TARGET_REGION });
  await ses.sendEmail(params).promise();
};

export const lambdaHandler: SNSHandler = async (event) => {
  try {
    const message = event.Records[0].Sns.Message;
    console.log(`message: ${message}`);

    const donation = await getDonation(JSON.parse(message).donationId as string);

    if (donation) {
      await sendThankyouEmail(donation);
    }
  } catch (err) {
    console.error(err);
  }
};
