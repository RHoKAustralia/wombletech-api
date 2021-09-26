import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { Item } from "../../lib/item";
import { createResponseBody } from "../../lib/response";
import { validateItem } from "../../lib/validateItem";
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

    const { valid, errors } = validateItem(item, true);
    if (!valid) {
      return createResponseBody(400, { message: errors });
    }

    const {donationId, ...attributes} = {...item};
    const map = new Map(Object.entries(attributes));
    const keys = Object.keys(attributes);

    const params = {
      TableName: "wombletech_donations_type",
      Key: { donationId: item.donationId ?? "", recordType: `item_${item.itemId}` },
      UpdateExpression: `SET ${keys.map((k, idx) => `#k_${idx} = :v_${idx}`).join(', ')}`,
      ExpressionAttributeValues: keys.reduce((acc, k, idx) => ({ ...acc, [`:v_${idx}`]: map.get(k) }), {}),
      ExpressionAttributeNames: keys.reduce((acc, k, idx) => ({ ...acc, [`#k_${idx}`]: k }), {}),
      ReturnValues: "UPDATED_NEW",
    };

    await ddb.update(params).promise();

    let response = createResponseBody(200, attributes);
    return response;
  } catch (err) {
    console.log(err);
    return createResponseBody(500,{ message: "Go look at the logs..." });
  }
};