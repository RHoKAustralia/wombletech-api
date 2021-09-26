import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import AWS from "aws-sdk";
import { Donation } from "../../lib/donation";
import { createResponseBody } from "../../lib/response";
import { validateDonation } from "../../lib/validateDonation";

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
    const donation: Donation = JSON.parse(event.body ?? "{}");

    const { valid, errors } = validateDonation(donation, true);
    if (!valid) {
      return createResponseBody(400, { message: errors });
    }

    const {donationId, submitDate, ...attributes} = {...donation};
    const map = new Map(Object.entries(attributes));
    const keys = Object.keys(attributes);

    const params = {
      TableName: "wombletech_donations_type",
      Key: { donationId: donation.donationId ?? "", recordType: "header" },
      UpdateExpression: `SET ${keys.map((k, idx) => `#k_${idx} = :v_${idx}`).join(', ')}`,
      ExpressionAttributeValues: keys.reduce((acc, k, idx) => ({ ...acc, [`:v_${idx}`]: map.get(k) }), {}),
      ExpressionAttributeNames: keys.reduce((acc, k, idx) => ({ ...acc, [`#k_${idx}`]: k }), {}),
      ReturnValues: "UPDATED_NEW",
    };

    await ddb.update(params).promise();

    let response = createResponseBody(200, {donationId, ...attributes});
    return response;
  } catch (err) {
    console.log(err);
    return createResponseBody(500,{ message: "Go look at the logs..." });
  }
};
