import { JSONSchemaType } from "ajv";

export interface DonationQueryCursor {
  donationId?: string;
  submitDate?: string;
}

export interface Donation {
  donationId?: string;
  name: string;
  email: string;
  phoneNumber: string;
  suburb: string;
  region: string;
  donationType: string;
  description: string;
  submitDate?: string;
}

export const DonationIdentityRequiredPatch = {
  $id: "identity-required-patch#",
  $patch: {
    source: { $ref: "donation.json#" },
    with: [
      {
        op: "add",
        path: "/required/-",
        value: "donationId",
      },
    ],
  },
};

export const DonationSchema: JSONSchemaType<Donation> = {
  $id: "donation.json#",
  type: "object",
  properties: {
    donationId: { type: "string", nullable: true, format: "uuid" },
    name: { type: "string" },
    email: { type: "string", format: "email" },
    phoneNumber: { type: "string" },
    suburb: { type: "string" },
    region: { type: "string" },
    donationType: { type: "string" },
    description: { type: "string" },
    submitDate: { type: "string", nullable: true, format: "date-time" },
  },
  required: [
    "name",
    "email",
    "phoneNumber",
    "suburb",
    "region",
    "donationType",
    "description",
  ],
  additionalProperties: false,
};
