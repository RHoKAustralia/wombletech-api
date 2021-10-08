import { JSONSchemaType } from 'ajv';

export interface Donation {
  donationId: string;
  active: boolean;
  name: string;
  email: string;
  phoneNumber: string;
  suburb: string;
  region: string;
  donationType: string;
  description: string;
  submitDate?: string;
}

export const DonationSchema: JSONSchemaType<Donation> = {
  $id: 'donation.json#',
  type: 'object',
  properties: {
    donationId: { type: 'string' },
    active: { type: 'boolean' },
    name: { type: 'string' },
    email: { type: 'string', format: 'email' },
    phoneNumber: { type: 'string' },
    suburb: { type: 'string' },
    region: { type: 'string' },
    donationType: { type: 'string' },
    description: { type: 'string' },
    submitDate: { type: 'string', nullable: true, format: 'date-time' },
  },
  required: [
    'donationId',
    'name',
    'email',
    'phoneNumber',
    'suburb',
    'region',
    'donationType',
    'description',
  ],
  additionalProperties: false,
};
