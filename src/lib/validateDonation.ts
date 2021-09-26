import Ajv from "ajv";
import addFormats from "ajv-formats";
import {
  Donation,
  DonationSchema,
  DonationIdentityRequiredPatch,
} from "./donation";

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
require("ajv-merge-patch")(ajv);
const validateWithRequiredIdentity = ajv
  .addSchema(DonationSchema)
  .compile(DonationIdentityRequiredPatch);
const validateWithoutRequiredIdentity = ajv.compile(DonationSchema);

export const validateDonation = (
  donation: Donation,
  identityRequired: boolean = false
): { valid: boolean; errors: unknown } => {
  const validate = identityRequired
    ? validateWithRequiredIdentity
    : validateWithoutRequiredIdentity;

  const valid = validate(donation);
  return { valid, errors: validate.errors };
};
