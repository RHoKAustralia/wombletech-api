import AWS from "aws-sdk";
import { Donation, DonationQueryCursor } from "./donation";
import { encode } from "./encoding";
import { Item } from "./item";
import { serialize } from "./serialize";
import { PimaryKey } from "./types";
const { v4: uuidv4 } = require("uuid");

const ddb = new AWS.DynamoDB.DocumentClient({
  region: process.env.TARGET_REGION,
});

const TABLE_NAME = "wombletech_donations_type";

const updateRecord = (attributes: any, key: any) => {
  const map = new Map(Object.entries(attributes));
  const keys = Object.keys(attributes);

  const params = {
    TableName: TABLE_NAME,
    Key: key, 
    UpdateExpression: 
      `SET ${keys.map((k, idx) => `#k_${idx} = :v_${idx}`).join(", ")}`,
    ExpressionAttributeValues: 
      keys.reduce((acc, k, idx) => ({ ...acc, [`:v_${idx}`]: map.get(k) }), {}),
    ExpressionAttributeNames: 
      keys.reduce((acc, k, idx) => ({ ...acc, [`#k_${idx}`]: k }), {}),
    ReturnValues: "UPDATED_NEW",
  };

  return ddb.update(params).promise();
} 

export const readDonations = async (
  limit?: number,
  ascending?: boolean,
  startKey?: DonationQueryCursor
) => {
  const params = {
    TableName: TABLE_NAME,
    IndexName: "recordType-submitDate-index",
    KeyConditionExpression: "recordType = :recordType",
    ExpressionAttributeValues: { ":recordType": "header" },
    ScanIndexForward: ascending ?? false,
    Limit: Math.min(limit ?? 10, 50),
  };

  const exclusiveStartKey: any = {};
  if (startKey?.submitDate && startKey.donationId) {
    exclusiveStartKey.ExclusiveStartKey = {
      recordType: "header",
      submitDate: startKey.submitDate,
      donationId: startKey.donationId,
    };
  }

  const data = await ddb.query({ ...params, ...exclusiveStartKey }).promise();

  const donations = data.Items?.map((i) => {
    const { recordType, ...remaining } = { ...(i as PimaryKey) };
    return remaining as Donation;
  });

  const { recordType, ...lastEvaluatedKey } = {
    ...(data.LastEvaluatedKey as PimaryKey),
  };
  const newCursor = data.LastEvaluatedKey
    ? encode(serialize(lastEvaluatedKey))
    : null;

  return { donations, newCursor };
};

export const insertDonation = (donation: Donation) => {
  donation.donationId = uuidv4().toString();
  donation.submitDate = new Date().toISOString();

  const params = {
    TableName: TABLE_NAME,
    Item: { ...donation, recordType: "header" },
  };

  return ddb.put(params).promise();
};

export const updateDonation = (donation: Donation) => {
  const { donationId, submitDate, ...attributes } = { ...donation };

  return updateRecord(attributes, { donationId: donation.donationId ?? "", recordType: "header" });
};

export const readDonatedItems = async (donationId: string) => {
  const params = {
    TableName: "wombletech_donations_type",
    KeyConditionExpression:
      "#donationId = :donationId AND begins_with(#recordType, :recordType)",
    ExpressionAttributeNames: {
      "#recordType": "recordType",
      "#donationId": "donationId",
    },
    ExpressionAttributeValues: {
      ":recordType": "item_",
      ":donationId": donationId,
    },
  };

  const data = await ddb.query(params).promise();

  const items = data.Items?.map((i) => {
    const { donationId, recordType, ...remaining } = { ...(i as PimaryKey) };
    return remaining as Item;
  });

  return items;
};

export const donationExists = async (donationId: string) => {
  const params = {
    TableName: "wombletech_donations_type",
    Key: {
      donationId: donationId,
      recordType: "header",
    },
  };

  const header = await ddb.get(params).promise();
  return Object.keys(header).length > 0;
};

export const insertDonatedItem = (item: Item) => {
  item.itemId = uuidv4().toString();

  const params = {
    TableName: "wombletech_donations_type",
    Item: { ...item, recordType: `item_${item.itemId}` },
  };

  return ddb.put(params).promise();
};

export const updateDonatedItem = (item: Item) => {
  const { donationId, ...attributes } = { ...item };

  return updateRecord(attributes, {
    donationId: item.donationId ?? "",
    recordType: `item_${item.itemId}`,
  });
};
