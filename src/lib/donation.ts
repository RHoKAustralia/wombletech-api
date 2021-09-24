import { JSONSchemaType } from "ajv";
export interface Donation {
  donationId?: string;
  name: string;
  email: string;
  phoneNumber: string;
  suburb: string;
  region: string;
  donationType: string;
  description: string;
}

export const DonationSchema: JSONSchemaType<Donation> = {
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
  },
  required: ["name", "email", "donationType", "description"],
  additionalProperties: false,
};
