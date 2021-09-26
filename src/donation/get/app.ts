import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import AWS from "aws-sdk";
import { Donation, DonationQueryCursor } from "../../lib/donation";
import { PimaryKey, QueryParams } from "../../lib/types";
import { createResponseBody } from "../../lib/response";
import { serialize } from "../../lib/serialize";
const ddb = new AWS.DynamoDB.DocumentClient({
  region: process.env.TARGET_REGION,
});
import { encode, decode } from "../../lib/encoding"

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */
exports.lambdaHandler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  try {
    const query = event.queryStringParameters as QueryParams;
    const {limit, ascending, cursor} = {...query}

    const startKey = (cursor ? JSON.parse(decode(cursor)) : null) as DonationQueryCursor;
    const data = await readDonations(limit, ascending, startKey);

    const filtered = data.Items?.map(i => {
      const {recordType, ...remaining} = {...(i as PimaryKey)};
      return remaining as Donation;
    });

    const {recordType, ...lastEvaluatedKey} = {...(data.LastEvaluatedKey as PimaryKey)}
    const newCursor = data.LastEvaluatedKey ? encode(serialize(lastEvaluatedKey)) : null

    const response = createResponseBody(200, { items: filtered ?? [], cursor: newCursor });
    return response;
  } catch (err) {
    console.log(err);
    return createResponseBody(500,{ message: "Go look at the logs..." });
  }
};

function readDonations(limit?: number, ascending?: boolean, startKey?: DonationQueryCursor) {
  const params = {
    TableName: "wombletech_donations_type",
    IndexName: "recordType-submitDate-index",
    KeyConditionExpression: "recordType = :recordType",
    ExpressionAttributeValues: { ":recordType": "header" },
    ScanIndexForward: ascending ?? false,
    Limit: Math.min(limit ?? 10, 50)
  };

  const exclusiveStartKey: any = {};
  if (startKey?.submitDate && startKey.donationId){
    exclusiveStartKey.ExclusiveStartKey = { 
      recordType: "header",
      submitDate: startKey.submitDate,
      donationId: startKey.donationId
    }
  }

  return ddb.query({...params, ...exclusiveStartKey}).promise();
}
