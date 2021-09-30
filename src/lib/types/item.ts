import { JSONSchemaType } from "ajv";

export interface Item {
  donationId: string;
  itemId: string;
  description: string;
}

export const ItemSchema: JSONSchemaType<Item> = {
  $id: "item.json#",
  type: "object",
  properties: {
    donationId: { type: "string", format: "uuid" },
    itemId: { type: "string", format: "uuid" },
    description: { type: "string" },
  },
  required: [
    "donationId",
    "itemId",
    "description"
  ],
  additionalProperties: false,
};
