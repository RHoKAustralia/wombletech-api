import { Item } from '../types/item';
import { documentClient, PimaryKey, TABLE_NAME, updateRecord } from './common';

export const readDonatedItems = async (donationId: string) => {
  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: '#donationId = :donationId AND begins_with(#recordType, :recordType)',
    ExpressionAttributeNames: {
      '#recordType': 'recordType',
      '#donationId': 'donationId',
    },
    ExpressionAttributeValues: {
      ':recordType': 'item_',
      ':donationId': donationId,
    },
  };

  const data = await documentClient.query(params).promise();

  const items = data.Items?.map((i) => {
    const { donationId, recordType, ...remaining } = { ...(i as PimaryKey) };
    return remaining as Item;
  });

  return items;
};

export const insertDonatedItem = (item: Item) => {
  const params = {
    TableName: TABLE_NAME,
    Item: { ...item, recordType: `item_${item.itemId}` },
  };

  return documentClient.put(params).promise();
};

export const updateDonatedItem = (item: Item) => {
  const { donationId, ...attributes } = { ...item };

  return updateRecord(attributes, {
    donationId: item.donationId ?? '',
    recordType: `item_${item.itemId}`,
  });
};
