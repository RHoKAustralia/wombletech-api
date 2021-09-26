import { JSONSchemaType } from "ajv";

export interface Item {
  donationId?: string;
  itemId?: string;
  description: string;
}

export const ItemIdentityRequiredPatch = {
  $id: "identity-required-patch#",
  $patch: {
    source: { $ref: "item.json#" },
    with: [
      {
        op: "add",
        path: "/required/-",
        value: "itemId",
      },
    ],
  },
};

export const ItemSchema: JSONSchemaType<Item> = {
  $id: "item.json#",
  type: "object",
  properties: {
    donationId: { type: "string", nullable: true, format: "uuid" },
    itemId: { type: "string", nullable: true, format: "uuid" },
    description: { type: "string" },
  },
  required: ["description"],
  additionalProperties: false,
};
