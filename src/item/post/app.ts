import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { createResponseBody } from "../../lib/response";
import { validateItem } from "../../lib/validateItem";
import { Item } from "../../lib/item";
import { donationExists, insertDonatedItem } from "../../lib/database";


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

    const exists = await donationExists(item.donationId);
    if (!exists) {
      let response = createResponseBody(400, {message: "Header record does not exist"});
      return response;
    }

    await insertDonatedItem(item);

    const {donationId, ...attributes} = item;
    let response = createResponseBody(200, attributes);
    return response;
  } catch (err) {
    console.log(err);
    return createResponseBody(500,{ message: "Go look at the logs..." });
  }
};
