import { JSONSchemaType } from 'ajv';

export interface Item {
  donationId?: string;
  itemId: string;
  description: string;
}

export const ItemSchema: JSONSchemaType<Item> = {
  $id: 'item.json#',
  type: 'object',
  properties: {
    donationId: { type: 'string', nullable: true },
    itemId: { type: 'string' },
    description: { type: 'string' },
  },
  required: ['itemId', 'description'],
  additionalProperties: false,
};
