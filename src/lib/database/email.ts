import { documentClient, TABLE_NAME } from './common';
import { Email } from '../types/email';
import { PromiseResult } from 'aws-sdk/lib/request';
import { PutItemOutput } from 'aws-sdk/clients/dynamodb';
import { AWSError } from 'aws-sdk';

export const insertEmailToUnsortedQueue = (
  email: Email
): Promise<PromiseResult<PutItemOutput, AWSError>> => {
  const params = {
    TableName: TABLE_NAME,
    Item: { donationId: 'system_unsorted', recordType: `email_${email.key}`, ...email },
  };

  return documentClient.put(params).promise();
};

export const attachEmailToDonation = (
  donationId: string,
  email: Email
): Promise<PromiseResult<PutItemOutput, AWSError>> => {
  const params = {
    TableName: TABLE_NAME,
    Item: { donationId: donationId, recordType: `email_${email.key}`, ...email },
  };

  return documentClient.put(params).promise();
};
