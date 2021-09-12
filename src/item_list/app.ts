import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import AWS from "aws-sdk";
import { serialize } from "../lib/serialize";
const ddb = new AWS.DynamoDB.DocumentClient({
  region: process.env.TARGET_REGION,
});

// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';

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
    let data = await readMessage();
    let response = {
      statusCode: 200,
      body: serialize(data.Items),
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      },
    };
    return response;
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      body: "Go look at the logs...",
    };
  }
};

function readMessage() {
  const params = {
    TableName: "wombletech_donations",
    Limit: 10,
  };
  return ddb.scan(params).promise();
}
