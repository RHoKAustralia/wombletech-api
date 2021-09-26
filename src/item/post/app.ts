import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { createResponseBody } from "../../lib/response";
import { validateItem } from "../../lib/validateItem";
const { v4: uuidv4 } = require("uuid");
import { Item } from "../../lib/item";
import AWS from "aws-sdk";

const ddb = new AWS.DynamoDB.DocumentClient({
  region: process.env.TARGET_REGION,
});

exports.lambdaHandler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const { id } = event.pathParameters as { id: string };

    const item: Item = JSON.parse(event.body ?? "{}");
    item.donationId = id;
    const { valid, errors } = validateItem(item);
    if (!valid) {
      return createResponseBody(400, { message: errors });
    }

    const exists = await headerExists(item.donationId);
    if (!exists) {
      let response = createResponseBody(400, {message: "Header record does not exist"});
      return response;
    }

    item.itemId = uuidv4().toString();

    const params = {
      TableName: "wombletech_donations_type",
      Item: {...item, recordType: `item_${item.itemId}`},
    };
    await ddb.put(params).promise();

    const {donationId, ...attributes} = item;
    let response = createResponseBody(200, attributes);
    return response;
  } catch (err) {
    console.log(err);
    return createResponseBody(500,{ message: "Go look at the logs..." });
  }
};

const headerExists = async (donationId: string) => {
  const getParams = {
    TableName: "wombletech_donations_type",
    Key: { 
      donationId: donationId,
      recordType: "header"
    }, 
  };

  const header = await ddb.get(getParams).promise();
  return Object.keys(header).length > 0;
}