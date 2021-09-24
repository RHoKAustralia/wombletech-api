import Ajv, { ValidateFunction } from "ajv";
import addFormats from "ajv-formats";
import { Donation, DonationSchema } from "./donation";

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

export const validateDonation = (
  donation: Donation
): { valid: boolean; errors: unknown } => {
  const validate = ajv.compile(DonationSchema);
  const valid = validate(donation);
  return { valid, errors: validate.errors };
};
