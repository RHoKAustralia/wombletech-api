import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import AWS from "aws-sdk";
import { Donation } from "../../lib/donation";
import { createResponseBody } from "../../lib/response";
const ddb = new AWS.DynamoDB.DocumentClient({
  region: process.env.TARGET_REGION,
});

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
    const data = await readDonations();

    const filtered = data.Items?.map(i => {
      const {recordType, ...remaining} = {...(i as {recordType: string})};
      return remaining as Donation;
    });

    const response = createResponseBody(200, filtered ?? []);

    return response;
  } catch (err) {
    console.log(err);
    return createResponseBody(500,{ message: "Go look at the logs..." });
  }
};

function readDonations() {
  const params = {
    TableName: "wombletech_donations_type",
    FilterExpression: "recordType = :recordType",
    ExpressionAttributeValues: { ":recordType": "header" }
  };
  return ddb.scan(params).promise();
}
