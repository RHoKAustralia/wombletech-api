import Ajv from "ajv";
import addFormats from "ajv-formats";
import { Item, ItemSchema, ItemIdentityRequiredPatch } from "./item";

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);
require("ajv-merge-patch")(ajv);
const validateWithRequiredIdentity = ajv
  .addSchema(ItemSchema)
  .compile(ItemIdentityRequiredPatch);
const validateWithoutRequiredIdentity = ajv.compile(ItemSchema);

export const validateItem = (
  item: Item,
  identityRequired: boolean = false
): { valid: boolean; errors: unknown } => {
  const validate = identityRequired
    ? validateWithRequiredIdentity
    : validateWithoutRequiredIdentity;

  const valid = validate(item);
  return { valid, errors: validate.errors };
};
