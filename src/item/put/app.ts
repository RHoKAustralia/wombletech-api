import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { Item } from "../../lib/item";
import { createResponseBody } from "../../lib/response";
import { validateItem } from "../../lib/validateItem";
import { updateDonatedItem } from "../../lib/database";

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

    await updateDonatedItem(item);

    const {donationId, ...attributes} = {...item};
    let response = createResponseBody(200, attributes);
    return response;
  } catch (err) {
    console.log(err);
    return createResponseBody(500,{ message: "Go look at the logs..." });
  }
};