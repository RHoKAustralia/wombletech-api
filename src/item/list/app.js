const AWS = require("aws-sdk");
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
exports.lambdaHandler = async (event, context, callback) => {
  try {
    await readMessage()
      .then((data) => {
        // Writes each item to the console
        data.Items.forEach(function (item) {
          console.log(item.message);
        });
        callback(null, {
          // If success return 200, and items
          statusCode: 200,
          body: JSON.stringify(data.Items),
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json",
          },
        });
      })
      .catch((err) => {
        // If an error occurs write to the console
        console.error(err);
      });
  } catch (err) {
    console.log(err);
    return err;
  }
};

function readMessage() {
  const params = {
    TableName: "wombletech_donations",
    Limit: 10,
  };
  return ddb.scan(params).promise();
}
