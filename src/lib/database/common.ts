import AWS from 'aws-sdk';

export const TABLE_NAME = 'wombletech_donations_type';

export const documentClient = new AWS.DynamoDB.DocumentClient({
  region: process.env.TARGET_REGION,
});

export interface PimaryKey {
  donationId: string;
  recordType: string;
}

export const updateRecord = (attributes: any, key: any) => {
  const map = new Map(Object.entries(attributes));
  const keys = Object.keys(attributes);

  const params = {
    TableName: TABLE_NAME,
    Key: key,
    UpdateExpression: `SET ${keys.map((k, idx) => `#k_${idx} = :v_${idx}`).join(', ')}`,
    ExpressionAttributeValues: keys.reduce(
      (acc, k, idx) => ({ ...acc, [`:v_${idx}`]: map.get(k) }),
      {}
    ),
    ExpressionAttributeNames: keys.reduce((acc, k, idx) => ({ ...acc, [`#k_${idx}`]: k }), {}),
    ReturnValues: 'UPDATED_NEW',
  };

  return documentClient.update(params).promise();
};
