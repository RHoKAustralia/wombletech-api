import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { createResponseBody } from "../../lib/response";
import AWS from "aws-sdk";
import { Item } from "../../lib/item";
import { PimaryKey } from "../../lib/types";

const ddb = new AWS.DynamoDB.DocumentClient({
  region: process.env.TARGET_REGION,
});

exports.lambdaHandler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const { id } = event.pathParameters as { id: string };

    const data = await readItems(id);
    
    const filtered = data.Items?.map(i => {
      const {donationId, recordType, ...remaining} = {...(i as PimaryKey)};
      return remaining as Item;
    });

    const response = createResponseBody(200, filtered ?? []);
    return response;
  } catch (err) {
    console.log(err);
    return createResponseBody(500,{ message: "Go look at the logs..." });
  }
};

function readItems(donationId: string) {
  const params = {
    TableName: "wombletech_donations_type",
    KeyConditionExpression: "#donationId = :donationId AND begins_with(#recordType, :recordType)",
    ExpressionAttributeNames: { 
      "#recordType": "recordType", 
      "#donationId": "donationId" 
    },
    ExpressionAttributeValues: { 
      ":recordType": "item_", 
      ":donationId": donationId 
    }
  };

  return ddb.query(params).promise();
}