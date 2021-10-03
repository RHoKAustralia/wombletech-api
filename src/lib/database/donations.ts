import { Donation, DonationQueryCursor } from '../types/donation';
import { encode } from '../encoding';
import { serialize } from '../serialize';
import { documentClient, PimaryKey, TABLE_NAME, updateRecord } from './common';

export const readDonations = async (
  limit?: number,
  ascending?: boolean,
  startKey?: DonationQueryCursor
) => {
  const params = {
    TableName: TABLE_NAME,
    IndexName: 'recordType-submitDate-index',
    KeyConditionExpression: 'recordType = :recordType',
    ExpressionAttributeValues: { ':recordType': 'header' },
    ScanIndexForward: ascending ?? false,
    Limit: Math.min(limit ?? 10, 50),
  };

  const exclusiveStartKey: any = {};
  if (startKey?.submitDate && startKey.donationId) {
    exclusiveStartKey.ExclusiveStartKey = {
      recordType: 'header',
      submitDate: startKey.submitDate,
      donationId: startKey.donationId,
    };
  }

  const data = await documentClient.query({ ...params, ...exclusiveStartKey }).promise();

  const donations = data.Items?.map((i) => {
    const { recordType, ...remaining } = { ...(i as PimaryKey) };
    return remaining as Donation;
  });

  const { recordType, ...lastEvaluatedKey } = {
    ...(data.LastEvaluatedKey as PimaryKey),
  };
  const newCursor = data.LastEvaluatedKey ? encode(serialize(lastEvaluatedKey)) : null;

  return { donations, newCursor };
};

export const insertDonation = async (donation: Donation): Promise<void> => {
  donation.submitDate = new Date().toISOString();

  const params = {
    TableName: TABLE_NAME,
    Item: { ...donation, recordType: 'header' },
  };

  await documentClient.put(params).promise();
};

export const updateDonation = async (donation: Donation): Promise<void> => {
  const { donationId, submitDate, ...attributes } = { ...donation };

  await updateRecord(attributes, { donationId: donation.donationId ?? '', recordType: 'header' });
};

export const donationExists = async (donationId: string): Promise<boolean> => {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      donationId: donationId,
      recordType: 'header',
    },
  };

  const header = await documentClient.get(params).promise();
  return Object.keys(header).length > 0;
};

export const getDonation = async (donationId: string): Promise<Donation> => {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      donationId: donationId,
      recordType: 'header',
    },
  };

  const header = await documentClient.get(params).promise();

  const { recordType, ...remaining } = { ...(header.Item as PimaryKey) };
  return remaining as Donation;
};
