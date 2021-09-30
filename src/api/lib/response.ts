import { APIGatewayProxyResult } from 'aws-lambda';
import { serialize } from '../../lib/serialize';

export const createResponseBody = (
  httpCode: number,
  responseBody: unknown
): APIGatewayProxyResult => {
  return {
    statusCode: httpCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
    body: serialize(responseBody),
  };
};
