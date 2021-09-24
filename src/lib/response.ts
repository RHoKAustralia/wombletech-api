import { APIGatewayProxyResult } from "aws-lambda";
import { serialize } from "./serialize";

export const createResponseBody = (
  httpCode: number,
  responseBody: object
): APIGatewayProxyResult => {
  return {
    statusCode: httpCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
    },
    body: serialize(responseBody),
  };
};
