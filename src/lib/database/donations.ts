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

export const insertDonation = (donation: Donation) => {
  donation.submitDate = new Date().toISOString();

  const params = {
    TableName: TABLE_NAME,
    Item: { ...donation, recordType: 'header' },
  };

  return documentClient.put(params).promise();
};

export const updateDonation = (donation: Donation) => {
  const { donationId, submitDate, ...attributes } = { ...donation };

  return updateRecord(attributes, { donationId: donation.donationId ?? '', recordType: 'header' });
};

export const donationExists = async (donationId: string) => {
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
